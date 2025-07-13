import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { paginate } from '../utils/database';
import { PostStatus } from '@prisma/client';

export async function createPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, content, excerpt, tags = [], status = 'DRAFT' } = req.body;
    const authorId = req.user!.userId;
    const coverImage = req.file?.filename;

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 160) + '...',
        coverImage: coverImage ? `/uploads/images/${coverImage}` : null,
        status: status as PostStatus,
        authorId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Handle tags
    if (tags.length > 0) {
      await handlePostTags(post.id, tags);
    }

    // Fetch complete post with tags
    const completePost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: completePost },
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
    });
  }
}

export async function getPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      page = 1,
      limit = 2, // Assessment requirement: 2 posts per page
      status,
      tag,
      author,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = req.query;

    let whereClause: any = {};

    // For non-authenticated users, only show published posts
    if (!req.user) {
      whereClause = {
        status: 'PUBLISHED',
      };
    } else {
      // Authenticated users can see their own posts in any state + published posts
      whereClause = {
        OR: [
          { status: 'PUBLISHED' },
          { authorId: req.user.userId },
        ],
      };
    }

    // Apply filters
    if (status) {
      whereClause.status = status;
    }

    if (author) {
      whereClause.author = {
        username: author,
      };
    }

    if (tag) {
      whereClause.postTags = {
        some: {
          tag: {
            name: { contains: tag as string, mode: 'insensitive' },
          },
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const result = await paginate(prisma.post, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      where: whereClause,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    

    // Add likedByCurrentUser to each post if authenticated
    let likedPostIds: Set<string> = new Set();
    if (req.user) {
      // Debug log for userId and liked postIds
      console.log('Checking likes for user:', req.user.userId);
      const userLikes = await prisma.postLike.findMany({
        where: { userId: req.user.userId },
        select: { postId: true },
      });
      console.log('User likes:', userLikes.map(like => like.postId));
      likedPostIds = new Set(userLikes.map(like => like.postId));
    }
    const postsWithLike = result.data.map((post: any) => ({
      ...post,
      likedByCurrentUser: req.user ? likedPostIds.has(post.id) : false,
    }));
    const response = {
      ...result,
      data: postsWithLike,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
    });
  }
}

export async function getPostById(req: AuthRequest, res: Response): Promise<void> {
  console.log('--- getPostById called ---');
  console.log('Authorization header:', req.headers['authorization']);
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    // Check if user can view this post
    const canView = 
      post.status === 'PUBLISHED' ||
      req.user?.userId === post.authorId;

    if (!canView) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this post',
      });
      return;
    }

    // Increment view count for published posts
    if (post.status === 'PUBLISHED') {
      await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    console.log('--- getPostById called  here ---');

    // Add likedByCurrentUser
    let likedByCurrentUser = false;
    console.log('\n==============================');
    console.log(req.user)
    console.log('\n==============================');
    if (req.user) {

      console.log('--- getPostById called like ---');
      // Beautified debug log for like check
      console.log('\n==============================');
      console.log('🔎 [LIKE CHECK]');
      console.log('  User ID:', req.user.userId);
      console.log('  Post ID:', id);
      const like = await prisma.postLike.findFirst({
        where: { userId: req.user.userId, postId: id },
      });
      console.log('  Like query result:', like);
      console.log('==============================\n');
      likedByCurrentUser = !!like;
    }

    res.json({
      success: true,
      data: { post: { ...post, likedByCurrentUser } },
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
    });
  }
}

export async function updatePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags = [], status } = req.body;
    const userId = req.user!.userId;
    const coverImage = req.file?.filename;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    if (existingPost.authorId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only edit your own posts',
      });
      return;
    }

    // Update post
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (status) {
      updateData.status = status;
      if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    if (coverImage) updateData.coverImage = `/uploads/images/${coverImage}`;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Handle tags
    if (tags.length > 0) {
      await handlePostTags(post.id, tags);
    }

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post },
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
    });
  }
}

export async function deletePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!existingPost) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    if (existingPost.authorId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
      return;
    }

    // Check if post has comments (requirement from assessment)
    if (existingPost._count.comments > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete post with comments',
      });
      return;
    }

    // Delete post (cascading will handle postTags)
    await prisma.post.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
}

export async function getUserPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 10, status } = req.query;

    let whereClause: any = { authorId: userId };
    
    if (status) {
      whereClause.status = status;
    }

    const result = await paginate(prisma.post, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      where: whereClause,
      include: {
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Add likedByCurrentUser to each post (for user's own posts, this is true if they liked their own post)
    let likedPostIds: Set<string> = new Set();
    if (req.user) {
      const userLikes = await prisma.postLike.findMany({
        where: { userId: req.user.userId },
        select: { postId: true },
      });
      likedPostIds = new Set(userLikes.map(like => like.postId));
    }
    const postsWithLike = result.data.map((post: any) => ({
      ...post,
      likedByCurrentUser: req.user ? likedPostIds.has(post.id) : false,
    }));
    const response = {
      ...result,
      data: postsWithLike,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
    });
  }
}

export async function getUserStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Get user's post statistics
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalComments
    ] = await Promise.all([
      // Total posts
      prisma.post.count({
        where: { authorId: userId }
      }),
      // Published posts
      prisma.post.count({
        where: { 
          authorId: userId,
          status: 'PUBLISHED'
        }
      }),
      // Draft posts
      prisma.post.count({
        where: { 
          authorId: userId,
          status: 'DRAFT'
        }
      }),
      // Total views across all posts
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: { viewCount: true }
      }),
      // Total comments on user's posts
      prisma.comment.count({
        where: {
          post: {
            authorId: userId
          }
        }
      })
    ]);

    const stats = {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.viewCount || 0,
      totalComments,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
    });
  }
}

// Like a post
export async function likePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existingLike) {
      res.status(400).json({ success: false, message: 'Post already liked' });
      return;
    }

    // Create like
    await prisma.postLike.create({ data: { userId, postId } });
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    const updatedPost = await prisma.post.findUnique({ where: { id: postId } });
    res.json({
      success: true,
      message: 'Post liked',
      data: { likeCount: updatedPost?.likeCount ?? 0 },
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
}

// Unlike a post
export async function unlikePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const postId = req.params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    // Check if like exists
    const existingLike = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existingLike) {
      res.status(400).json({ success: false, message: 'Post not liked yet' });
      return;
    }

    // Delete like
    await prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });

    const updatedPost = await prisma.post.findUnique({ where: { id: postId } });
    res.json({
      success: true,
      message: 'Post unliked',
      data: { likeCount: updatedPost?.likeCount ?? 0 },
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike post' });
  }
}

// Get all posts liked by the current user
export async function getLikedPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    // Find all post likes for this user
    const likedPosts = await prisma.postLike.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            postTags: {
              include: { tag: true },
            },
            _count: {
              select: { comments: true },
            },
          },
        },
      },
    });
    // Map to just the post objects
    const posts = likedPosts.map(like => like.post);
    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liked posts',
    });
  }
}

// Helper function to handle post tags
async function handlePostTags(postId: string, tagIds: string[]) {
  // Remove existing tags
  await prisma.postTag.deleteMany({
    where: { postId },
  });

  // Process tags
  for (const tagId of tagIds) {
    if (!tagId.trim()) continue;

    // Verify tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: tagId.trim() },
    });

    if (!tag) {
      console.warn(`Tag with ID ${tagId} not found, skipping...`);
      continue;
    }

    // Create post-tag relationship
    await prisma.postTag.create({
      data: {
        postId,
        tagId: tag.id,
      },
    });
  }
} 