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
  onEditPost?: (postId: string) => void;
}

export function PostCard({ post, onClick, onPostUpdated, onEditPost }: PostCardProps) {
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
    if (onEditPost) {
      onEditPost(post.id);
    }
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
    <article className="group cursor-pointer transition-all duration-300 hover:-translate-y-1">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}

        <div className="p-6 relative">
          {/* Owner Actions */}
          {isOwner && (
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleEdit}
                className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Edit post"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || post._count.comments > 0}
                className={`p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md ${
                  post._count.comments > 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
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
            <div className="flex flex-wrap gap-2 mb-4">
              {post.postTags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-100 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
                >
                  {tag.name}
                </span>
              ))}
              {post.postTags.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  +{post.postTags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {/* Author Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center ring-2 ring-blue-100">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Author Info */}
              <div>
                <div className="font-semibold text-gray-900 text-base">{authorName}</div>
                <div className="flex items-center space-x-3 text-gray-500 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={post.publishedAt}>{timeAgo}</time>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <button
            onClick={() => onClick(post.id)}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group-hover:scale-[1.01]"
          >
            Read Full Story
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </article>
  );
} 