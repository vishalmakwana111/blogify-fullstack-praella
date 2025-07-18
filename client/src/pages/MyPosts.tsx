import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/postService';
import { 
  FileText, 
  MessageCircle, 
  Eye, 
  Calendar,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CreatePostModal } from '../components/CreatePostModal';
import { EditPostModal } from '../components/EditPostModal';
// import { useGlobalPosts } from '../hooks/useGlobalPosts';
import type { Post } from '../types';
import { usePostStore } from '../stores/postStore';

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
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-300 ease-in-out hover:border-gray-300 bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {post.excerpt || post.content.substring(0, 120) + '...'}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
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
        
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onEditPost(post.id)}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-all duration-200 ease-in-out rounded-md hover:bg-blue-50 transform hover:scale-110"
            title="Edit post"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-all duration-200 ease-in-out rounded-md hover:bg-red-50 disabled:opacity-50 transform hover:scale-110 disabled:transform-none"
            title="Delete post"
          >
            {isDeleting ? (
              <LoadingSpinner className="w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MyPosts() {
  // const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const setLikedPostIds = usePostStore((state) => state.setLikedPostIds);

  // Global posts hook available if needed
  // const { refreshMyPosts } = useGlobalPosts();

  useEffect(() => {
    fetchPosts();
  }, []);

  // Listen for new posts created globally
  useEffect(() => {
    const handlePostCreated = (event: CustomEvent) => {
      const newPost = event.detail;
      // Add to the beginning of the posts list
      setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    window.addEventListener('postCreated', handlePostCreated as EventListener);
    return () => {
      window.removeEventListener('postCreated', handlePostCreated as EventListener);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getMyPosts();
      setPosts(response.data.data);
      // Always update liked post IDs in the store from backend
      const likedIds = response.data.data
        .filter((p: any) => p.likedByCurrentUser)
        .map((p: any) => p.id);
      setLikedPostIds(likedIds);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch posts');
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
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-1">
            Manage and edit your blog posts
          </p>
        </div>
        
        <button
          onClick={() => setIsCreatePostModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Posts List - Fixed Height Container */}
      <div className="flex-1 min-h-0">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Create your first post to get started!</p>
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">All Posts ({posts.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {posts.map((post) => (
                  <PostRow 
                    key={post.id} 
                    post={post} 
                    onPostUpdated={fetchPosts}
                    onEditPost={(postId) => {
                      setEditingPostId(postId);
                      setIsEditPostModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          fetchPosts(); // Refresh posts list
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
          fetchPosts(); // Refresh posts list
          setIsEditPostModalOpen(false);
          setEditingPostId(null);
        }}
      />
    </div>
  );
} 