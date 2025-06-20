import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import { commentService } from '../services/commentService';
import { 
  MessageCircle, 
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { Comment } from '../types';

interface CommentRowProps {
  comment: Comment;
  onCommentUpdated: () => void;
}

function CommentRow({ comment, onCommentUpdated }: CommentRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await commentService.deleteComment(comment.id);
      onCommentUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert('Comment content cannot be empty');
      return;
    }

    try {
      await commentService.updateComment(comment.id, { content: editContent });
      setIsEditing(false);
      onCommentUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/posts/${comment.post?.id || '#'}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
            >
              {comment.post?.title || 'Unknown Post'}
              <ExternalLink className="w-2 h-2" />
            </Link>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                rows={2}
                placeholder="Edit your comment..."
              />
              <div className="flex gap-1">
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-xs leading-relaxed">
              {comment.content}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-2 h-2" />
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-gray-400">
                (edited {new Date(comment.updatedAt).toLocaleDateString()})
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
            title="Edit comment"
          >
            <Edit className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 disabled:opacity-50"
            title="Delete comment"
          >
            {isDeleting ? (
              <LoadingSpinner className="w-3 h-3" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MyComments() {
  // const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentService.getUserComments();
      setComments(response.data.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="mx-auto" />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">My Comments</h1>
        <p className="text-gray-600 mt-1">
          Manage and reply to comments on your posts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 flex-shrink-0">
        <div className="bg-white p-3 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Total Comments</p>
              <p className="text-lg font-semibold text-gray-900">{comments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Approved</p>
              <p className="text-lg font-semibold text-gray-900">
                {comments.filter(c => c.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {comments.filter(c => c.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List - Fixed Height Container */}
      <div className="flex-1 min-h-0">
        {comments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-600">Comments on your posts will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">All Comments</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {comments.map((comment) => (
                  <CommentRow 
                    key={comment.id} 
                    comment={comment} 
                    onCommentUpdated={fetchComments}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 