import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/postService';
import { 
  PlusCircle, 
  FileText, 
  MessageCircle, 
  Eye, 
  TrendingUp,
  User,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CreatePostModal } from '../components/CreatePostModal';
import { EditPostModal } from '../components/EditPostModal';
// import { useGlobalPosts } from '../hooks/useGlobalPosts';
import type { Post } from '../types';

interface UserStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalComments: number;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-1">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-1.5 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="ml-2">
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

interface PostRowProps {
  post: Post;
  onPostUpdated: () => void;
  onEditPost: (postId: string) => void;
}

function PostRow({ post, onPostUpdated, onEditPost }: PostRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (post._count.comments > 0) {
      alert(`This post has ${post._count.comments} comment${post._count.comments !== 1 ? 's' : ''}. Posts with comments cannot be deleted.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      onPostUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 mb-1">{post.title}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            post.status === 'PUBLISHED' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {post.status}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {post._count.comments}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEditPost(post.id)}
          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit post"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Delete post"
        >
          {isDeleting ? (
            <LoadingSpinner className="w-3 h-3" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // const { refreshMyPosts } = useGlobalPosts();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for new posts created globally
  useEffect(() => {
    const handlePostCreated = (event: CustomEvent) => {
      const newPost = event.detail;
      setRecentPosts(prevPosts => [newPost, ...prevPosts.slice(0, 4)]); // Keep only 5 recent posts
    };

    window.addEventListener('postCreated', handlePostCreated as EventListener);
    return () => {
      window.removeEventListener('postCreated', handlePostCreated as EventListener);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsResponse, statsResponse] = await Promise.all([
        postService.getMyPosts({ limit: 5 }),
        postService.getUserStats(),
      ]);
      
      setRecentPosts(postsResponse.data.data);
      setStats(statsResponse.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
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
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Welcome back, {user?.firstName || user?.username}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your posts and track your blog's performance
        </p>
      </div>

      {/* Create Post CTA */}
      <div className="mb-3 flex-shrink-0">
        <button
          onClick={() => setIsCreatePostModalOpen(true)}
          className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out hover:shadow-md transform hover:-translate-y-0.5 shadow-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 flex-shrink-0">
        <Link
          to="/dashboard/posts"
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5"
        >
          <FileText className="w-4 h-4" />
          <span className="font-medium text-sm">My Posts</span>
        </Link>
        
        <Link
          to="/dashboard/comments"
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Comments</span>
        </Link>
        
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5"
        >
          <User className="w-4 h-4" />
          <span className="font-medium text-sm">Profile</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 flex-shrink-0">
        <StatsCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews}
          icon={Eye}
          color="green"
        />
        <StatsCard
          title="Comments"
          value={stats.totalComments}
          icon={MessageCircle}
          color="purple"
        />
        <StatsCard
          title="Published"
          value={stats.publishedPosts}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Recent Posts - Fixed Height Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 min-h-0 flex flex-col">
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link
              to="/dashboard/posts"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {recentPosts.length === 0 ? (
              <div className="p-4 text-center">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-3 text-sm">Create your first post to get started!</p>
                <button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="btn-primary text-sm"
                >
                  Create Post
                </button>
              </div>
            ) : (
              recentPosts.map((post) => (
                <PostRow 
                  key={post.id} 
                  post={post} 
                  onPostUpdated={fetchDashboardData}
                  onEditPost={(postId) => {
                    setEditingPostId(postId);
                    setIsEditPostModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          fetchDashboardData(); // Refresh dashboard data
          setIsCreatePostModalOpen(false);
        }}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditPostModalOpen}
        onClose={() => {
          setIsEditPostModalOpen(false);
          setEditingPostId(null);
        }}
        postId={editingPostId || undefined}
        onPostUpdated={() => {
          fetchDashboardData(); // Refresh dashboard data
          setIsEditPostModalOpen(false);
          setEditingPostId(null);
        }}
      />
    </div>
  );
} 