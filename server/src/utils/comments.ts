import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get comment count for a post
export async function getPostCommentCount(postId: string): Promise<number> {
  return prisma.comment.count({
    where: {
      postId,
      isApproved: true,
    },
  });
}

// Get comment tree structure
export async function getCommentTree(postId: string, limit = 50) {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
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
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  });

  // Build tree structure
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentMap.get(comment.id));
      }
    } else {
      rootComments.push(commentMap.get(comment.id));
    }
  });

  return rootComments;
}

// Check if user can comment on post
export async function canUserComment(userId: string, postId: string): Promise<boolean> {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      status: 'PUBLISHED',
    },
  });

  if (!post) return false;

  // Check if user is active
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  return user?.isActive ?? false;
}

// Format comment for display
export function formatComment(comment: any) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      id: comment.author.id,
      username: comment.author.username,
      displayName: comment.author.firstName && comment.author.lastName 
        ? `${comment.author.firstName} ${comment.author.lastName}`
        : comment.author.username,
      avatar: comment.author.avatar,
    },
    replies: comment.replies?.map(formatComment) || [],
    replyCount: comment.replies?.length || 0,
    isEdited: comment.updatedAt > comment.createdAt,
  };
}

// Get comment depth (for nested replies)
export function getCommentDepth(comment: any, maxDepth = 3): number {
  if (!comment.parentId) return 0;
  
  let depth = 0;
  let current = comment;
  
  while (current.parentId && depth < maxDepth) {
    depth++;
    // In a real implementation, you'd fetch the parent comment
    // For now, we'll just return the depth
    break;
  }
  
  return depth;
} 