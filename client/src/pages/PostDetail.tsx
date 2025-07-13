import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { usePostStore } from '../stores/postStore';
import { 
  Calendar, 
  Eye, 
  MessageCircle,
  ArrowLeft,
  Share,
  Edit,
  Clock,
  Tag,
  Bookmark,
  Heart
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CommentSection } from '../components/CommentSection';
import { EditPostModal } from '../components/EditPostModal';
import AISummary from '../components/AISummary';
import type { Post } from '../types';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Zustand store for like state
  const isPostLiked = usePostStore((state) => state.isPostLiked);
  const addLikedPostId = usePostStore((state) => state.addLikedPostId);
  const removeLikedPostId = usePostStore((state) => state.removeLikedPostId);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getPost(id!);
      setPost(response.data.post);
      setLikeCount(response.data.post.likeCount || 0);
      // Always sync liked post ID in the store with backend
      if (response.data.post.likedByCurrentUser) {
        addLikedPostId(response.data.post.id);
      } else {
        removeLikedPostId(response.data.post.id);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt || post?.content.substring(0, 150) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('You must be logged in to like posts.');
      return;
    }
    setIsLiking(true);
    try {
      if (!isPostLiked(post!.id)) {
        const res = await postService.likePost(post!.id);
        setLikeCount(res.data.likeCount);
        addLikedPostId(post!.id);
      } else {
        const res = await postService.unlikePost(post!.id);
        setLikeCount(res.data.likeCount);
        removeLikedPostId(post!.id);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const formatReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner className="mx-auto mb-4" />
              <p className="text-gray-600">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ErrorMessage message={error || 'Post not found'} />
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Article Column - Takes 3/4 of the space */}
          <div className="lg:col-span-3">
            {/* Tags */}
            {post.postTags && post.postTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.postTags.map((postTag: any) => (
                  <span
                    key={postTag.tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {postTag.tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Article Card */}
            <article className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              {/* Article Content */}
              <div className="p-6 lg:p-8">
                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Author and Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {post.author.firstName} {post.author.lastName}
                      </div>
                      <div className="text-gray-600 text-sm">@{post.author.username}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{formatReadTime(post.content)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{post.viewCount} views</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post._count?.comments || 0} comments</span>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>

                {/* AI Summary Section */}
                <div className="mt-6">
                  <AISummary postId={post.id} postTitle={post.title} />
                </div>

                {/* Article Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isPostLiked(post.id)
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart className={`w-4 h-4 ${isPostLiked(post.id) ? 'fill-current' : ''}`} />
                        <span>{likeCount}</span>
                      </button>
                      
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isBookmarked 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        <span>Save</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {user && post.author.id === user.id && (
                        <button
                          onClick={() => setIsEditPostModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-blue-200 text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 text-sm font-medium"
                      >
                        <Share className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="mt-8">
              <CommentSection postId={post.id} />
            </div>
          </div>

          {/* Sidebar - Takes 1/4 of the space */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Author Card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 shadow-md">
                    {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {post.author.firstName} {post.author.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">@{post.author.username}</p>
                  <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium">
                    Follow
                  </button>
                </div>
              </div>

              {/* Article Stats */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Article Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium text-gray-900">{post.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Comments</span>
                    <span className="font-medium text-gray-900">{post._count?.comments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium text-gray-900">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Read time</span>
                    <span className="font-medium text-gray-900">{formatReadTime(post.content)}</span>
                  </div>
                </div>
              </div>

              {/* Related Tags */}
              {post.postTags && post.postTags.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.postTags.map((postTag: any) => (
                      <span
                        key={postTag.tag.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        #{postTag.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditPostModalOpen}
        onClose={() => setIsEditPostModalOpen(false)}
        postId={post.id}
        onPostUpdated={() => {
          fetchPost();
          setIsEditPostModalOpen(false);
        }}
      />
    </div>
  );
} 