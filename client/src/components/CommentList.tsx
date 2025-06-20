import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Reply, Edit, Trash2, Check, X, Heart, MoreHorizontal } from 'lucide-react';
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
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const toggleLike = (commentId: string) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 bg-gray-200 rounded w-8"></div>
                    <div className="h-2 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const isLiked = likedComments.has(comment.id);
    const maxDepth = 3; // Limit nesting depth

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-4 md:ml-8' : ''}`}>
        <div className={`bg-gray-50/50 backdrop-blur-sm rounded-lg border border-gray-100 p-4 mb-4 hover:shadow-md transition-all duration-200 ${depth > 0 ? 'border-l-2 border-l-blue-200' : ''}`}>
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={getAuthorName(comment.author)}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">
                      {comment.author.firstName?.[0] || comment.author.username?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
              </div>
              
              <div>
                <div className="font-semibold text-gray-900">
                  {getAuthorName(comment.author)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>@{comment.author.username}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  {comment.updatedAt !== comment.createdAt && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">(edited)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Actions Menu */}
            {canModifyComment(comment) && (
              <div className="flex items-center gap-2">
                {editingComments.has(comment.id) ? (
                  <>
                    <button
                      onClick={() => saveEdit(comment.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelEditing(comment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="relative group">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {isCommentEditable(comment) && (
                        <button
                          onClick={() => startEditing(comment)}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit comment
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(comment.id)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingComments.has(comment.id) ? (
            <div className="mb-4">
              <textarea
                value={editContent[comment.id] || ''}
                onChange={(e) => setEditContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                rows={4}
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  {(editContent[comment.id] || '').length}/2000 characters
                </div>
                {(editContent[comment.id] || '').length > 1800 && (
                  <div className="text-xs text-orange-600">
                    {2000 - (editContent[comment.id] || '').length} characters remaining
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-800 mb-3 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleLike(comment.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  isLiked 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
            </div>

            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <MessageCircle className="w-3 h-3" />
                {isExpanded ? 'Hide' : 'Show'} {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>

        {/* Render Replies */}
        {hasReplies && isExpanded && (
          <div className="space-y-3">
            {comment.replies!.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => renderComment(comment))}
    </div>
  );
} 