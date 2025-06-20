import { useState, useEffect } from 'react';
import { CommentList } from './CommentList';
import { AddCommentForm } from './AddCommentForm';
import { commentService } from '../services/commentService';
import type { Comment } from '../services/commentService';
import { MessageCircle, Users, Clock, TrendingUp } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Comments Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Discussion
              </h2>
              <p className="text-gray-600 text-sm">
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
        </div>

        {/* Comment Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                <Users className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{commentCount}</div>
                <div className="text-xs text-gray-600">Comments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Active</div>
                <div className="text-xs text-gray-600">Discussion</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                <Clock className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Recent</div>
                <div className="text-xs text-gray-600">Activity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Form Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1">Share your thoughts</h3>
          <p className="text-gray-600 text-sm">Your perspective matters. Join the discussion below.</p>
        </div>
        <AddCommentForm
          postId={postId}
          onSubmit={handleCreateComment}
          placeholder="What are your thoughts on this article?"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-700 text-sm font-medium">{error}</div>
            <button
              onClick={fetchComments}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="p-4">
        {commentCount === 0 && !isLoading && !error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No comments yet</h3>
            <p className="text-gray-600 text-sm">Be the first to share your thoughts on this article.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CommentList
              comments={comments}
              onReply={handleReply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              isLoading={isLoading}
            />

            {/* Reply Forms */}
            {replyingTo && (
              <div className="mt-4 pl-3 border-l-2 border-blue-200">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Reply to comment</h4>
                  <p className="text-gray-600 text-xs">Your reply will be posted as a response to the comment above.</p>
                </div>
                <AddCommentForm
                  postId={postId}
                  parentId={replyingTo}
                  onSubmit={handleCreateComment}
                  onCancel={() => setReplyingTo(null)}
                  placeholder="Write your reply..."
                  isReply={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 