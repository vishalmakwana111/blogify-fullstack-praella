import { formatDistanceToNow } from 'date-fns';
import { Calendar, User, MessageCircle, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/postService';
import { useState } from 'react';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onClick: (postId: string) => void;
  onPostUpdated?: () => void;
}

export function PostCard({ post, onClick, onPostUpdated }: PostCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName = post.author.firstName && post.author.lastName
    ? `${post.author.firstName} ${post.author.lastName}`
    : post.author.username;

  const publishDate = new Date(post.publishedAt);
  const timeAgo = formatDistanceToNow(publishDate, { addSuffix: true });

  const isOwner = isAuthenticated && user?.id === post.author.id;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/posts/${post.id}/edit`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if post has comments (assessment requirement)
    const hasComments = post._count.comments > 0;
    const confirmMessage = hasComments 
      ? `This post has ${post._count.comments} comment${post._count.comments !== 1 ? 's' : ''}. Posts with comments cannot be deleted. You would need to delete all comments first.`
      : 'Are you sure you want to delete this post? This action cannot be undone.';
    
    if (hasComments) {
      alert(confirmMessage);
      return;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="card group cursor-pointer animate-fade-in">
      <div className="flex flex-col lg:flex-row overflow-hidden">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="lg:w-80 aspect-video lg:aspect-square bg-gray-100 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-8 relative">
          {/* Owner Actions */}
          {isOwner && (
            <div className="absolute top-4 right-4 flex gap-1">
              <button
                onClick={handleEdit}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit post"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || post._count.comments > 0}
                className={`p-1.5 transition-colors rounded-md ${
                  post._count.comments > 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                } ${isDeleting ? 'opacity-50' : ''}`}
                title={
                  post._count.comments > 0 
                    ? `Cannot delete: post has ${post._count.comments} comment${post._count.comments !== 1 ? 's' : ''}`
                    : "Delete post"
                }
              >
                {isDeleting ? (
                  <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Tags */}
          {post.postTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.postTags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200"
                >
                  {tag.name}
                </span>
              ))}
              {post.postTags.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{post.postTags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Title - Required by assessment */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information - Required by assessment */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            {/* Author Name - Required */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">{authorName}</span>
            </div>

            {/* Date - Required */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt}>
                {timeAgo}
              </time>
            </div>

            {/* Comment Count - Required */}
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Read More Button */}
          <button
            onClick={() => onClick(post.id)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Read Full Story
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </article>
  );
} 