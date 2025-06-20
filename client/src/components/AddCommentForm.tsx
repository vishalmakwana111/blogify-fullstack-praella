import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';

interface AddCommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
}

export function AddCommentForm({ 
  postId, 
  parentId, 
  onSubmit, 
  onCancel, 
  placeholder = "Write a comment...",
  isReply = false 
}: AddCommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 2000) {
      setError('Comment is too long (max 2000 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), parentId);
      setContent('');
      if (onCancel) onCancel(); // Close reply form after successful submit
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guest user prompt (PDF requirement)
  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Join the conversation
        </h3>
        <p className="text-gray-600 mb-4">
          Please sign in or create an account to leave a comment.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${isReply ? 'ml-4 md:ml-8' : ''}`}>
      {isReply && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Reply to comment</h4>
            <p className="text-sm text-gray-600">Your reply will be posted as a response to the comment above.</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 font-medium">
            {error}
          </div>
        )}

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={isReply ? 3 : 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed bg-gray-50 focus:bg-white transition-all"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {content.length}/2000 characters
            </div>
            {content.length > 1800 && (
              <div className="text-xs text-orange-600">
                {2000 - content.length} characters remaining
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {isReply && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Posting...' : (isReply ? 'Post Reply' : 'Post Comment')}
          </button>
        </div>
      </form>
    </div>
  );
} 