import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Reply, Edit, Trash2, User, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Comment } from '../services/commentService';

interface CommentListProps {
  comments: Comment[];
  onReply: (parentId: string) => void;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => void;
  isLoading?: boolean;
}

export function CommentList({ comments, onReply, onEdit, onDelete, isLoading }: CommentListProps) {
  const { user, isAuthenticated } = useAuth();
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingComments, setEditingComments] = useState<Set<string>>(new Set());
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const getAuthorName = (author: Comment['author']) => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.username;
  };

  const canModifyComment = (comment: Comment) => {
    if (!isAuthenticated || !user) return false;
    return comment.author.id === user.id;
  };

  const isCommentEditable = (comment: Comment) => {
    if (!canModifyComment(comment)) return false;
    
    // Check if comment is within 24-hour edit window
    const commentDate = new Date(comment.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
  };

  const startEditing = (comment: Comment) => {
    const newEditingComments = new Set(editingComments);
    newEditingComments.add(comment.id);
    setEditingComments(newEditingComments);
    setEditContent(prev => ({ ...prev, [comment.id]: comment.content }));
  };

  const cancelEditing = (commentId: string) => {
    const newEditingComments = new Set(editingComments);
    newEditingComments.delete(commentId);
    setEditingComments(newEditingComments);
    setEditContent(prev => {
      const newContent = { ...prev };
      delete newContent[commentId];
      return newContent;
    });
  };

  const saveEdit = async (commentId: string) => {
    const content = editContent[commentId];
    if (!content || !content.trim()) return;

    try {
      await onEdit(commentId, content.trim());
      cancelEditing(commentId);
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const maxDepth = 3; // Limit nesting depth

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={getAuthorName(comment.author)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {getAuthorName(comment.author)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.updatedAt !== comment.createdAt && (
                    <span className="ml-2 text-xs">(edited)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Actions */}
            {canModifyComment(comment) && (
              <div className="flex items-center gap-2">
                {editingComments.has(comment.id) ? (
                  <>
                    <button
                      onClick={() => saveEdit(comment.id)}
                      className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelEditing(comment.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {isCommentEditable(comment) && (
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit comment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingComments.has(comment.id) ? (
            <div className="mb-3">
              <textarea
                value={editContent[comment.id] || ''}
                onChange={(e) => setEditContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1">
                {(editContent[comment.id] || '').length}/2000 characters
              </div>
            </div>
          ) : (
            <div className="text-gray-700 mb-3 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-sm">
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {isExpanded ? 'Hide' : 'Show'} {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <div className="space-y-2">
            {comment.replies!.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="space-y-1">
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => renderComment(comment))}
    </div>
  );
} 