import React, { useState, useEffect } from 'react';
import { CommentList } from './CommentList';
import { AddCommentForm } from './AddCommentForm';
import { commentService } from '../services/commentService';
import type { Comment } from '../services/commentService';
import { MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
}

export function CommentSection({ postId, initialCommentCount = 0 }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await commentService.getPostComments(postId, {
        limit: 50, // Get more comments initially
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });
      
      if (response.success) {
        setComments(response.data.data);
        setCommentCount(response.data.pagination.totalItems);
      } else {
        setError(response.message || 'Failed to load comments');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async (content: string, parentId?: string) => {
    try {
      const response = await commentService.createComment({
        content,
        postId,
        parentId,
      });

      if (response.success) {
        // Refresh comments to get the latest data
        await fetchComments();
        setReplyingTo(null);
      } else {
        throw new Error(response.message || 'Failed to create comment');
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create comment');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const response = await commentService.updateComment(commentId, {
        content,
      });

      if (response.success) {
        // Update the comment in the local state
        setComments(prevComments => 
          updateCommentInTree(prevComments, commentId, response.data.comment)
        );
      } else {
        throw new Error(response.message || 'Failed to update comment');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update comment');
      throw err;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await commentService.deleteComment(commentId);

      if (response.success) {
        // Remove comment from local state
        setComments(prevComments => 
          removeCommentFromTree(prevComments, commentId)
        );
        setCommentCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(response.message || 'Failed to delete comment');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(replyingTo === parentId ? null : parentId);
  };

  // Helper function to update a comment in the nested tree structure
  const updateCommentInTree = (comments: Comment[], commentId: string, updatedComment: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return updatedComment;
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updatedComment)
        };
      }
      return comment;
    });
  };

  // Helper function to remove a comment from the nested tree structure
  const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies) {
        comment.replies = removeCommentFromTree(comment.replies, commentId);
      }
      return true;
    });
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Comments Header */}
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Comments ({commentCount})
          </h2>
        </div>

        {/* Add Comment Form */}
        <div className="mb-8">
          <AddCommentForm
            postId={postId}
            onSubmit={handleCreateComment}
            placeholder="Share your thoughts..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
            <button
              onClick={fetchComments}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          <CommentList
            comments={comments}
            onReply={handleReply}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            isLoading={isLoading}
          />

          {/* Reply Forms */}
          {replyingTo && (
            <div className="mt-4">
              <AddCommentForm
                postId={postId}
                parentId={replyingTo}
                onSubmit={handleCreateComment}
                onCancel={() => setReplyingTo(null)}
                placeholder="Write a reply..."
                isReply={true}
              />
            </div>
          )}


        </div>
      </div>
    </div>
  );
} 