import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { paginate } from '../utils/database';

const prisma = new PrismaClient();

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { content, postId, parentId } = req.body;
    const authorId = req.user!.userId;

    // Verify post exists and is published
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        status: 'PUBLISHED',
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found or not available for comments',
      });
      return;
    }

    // If replying to a comment, verify parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parentId,
          postId,
          isApproved: true,
        },
      });

      if (!parentComment) {
        res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
        return;
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
        parentId: parentId || null,
        isApproved: true, // Auto-approve for now
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
        replies: {
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
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
    });
  }
}

export async function getPostComments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    // Get root comments (no parent) with pagination
    const result = await paginate(prisma.comment, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      where: {
        postId,
        parentId: null,
        isApproved: true,
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
        replies: {
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
            replies: {
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
              where: {
                isApproved: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
    });
  }
}

export async function updateComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
      return;
    }

    if (existingComment.authorId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      });
      return;
    }

    // Check if comment is too old (24 hours edit window)
    const editWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const commentAge = Date.now() - existingComment.createdAt.getTime();
    
    if (commentAge > editWindow) {
      res.status(400).json({
        success: false,
        message: 'Comments can only be edited within 24 hours of posting',
      });
      return;
    }

    // Update comment
    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date(),
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

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
    });
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!existingComment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
      return;
    }

    if (existingComment.authorId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
      return;
    }

    // Check if comment has replies
    if (existingComment._count.replies > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete comment with replies',
      });
      return;
    }

    // Delete comment and update post comment count
    await prisma.$transaction([
      prisma.comment.delete({
        where: { id },
      }),
      prisma.post.update({
        where: { id: existingComment.postId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
    });
  }
}

export async function getUserComments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(prisma.comment, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      where: { authorId: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user comments',
    });
  }
} 