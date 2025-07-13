import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { postService } from '../services/postService';
import type { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Header } from '../components/common/Header';
import { EditPostModal } from '../components/EditPostModal';
// import { useGlobalPosts } from '../hooks/useGlobalPosts';

export function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 2,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // const { refreshPosts } = useGlobalPosts();


  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Robust pagination: auto-redirect if current page is empty but there are posts
  useEffect(() => {
    if (!loading && posts.length === 0 && pagination.totalItems > 0) {
      
      if (currentPage > pagination.totalPages && pagination.totalPages > 0) {
        setCurrentPage(pagination.totalPages);
      } else if (currentPage > 1 && pagination.totalPages > 0) {
        setCurrentPage(pagination.totalPages); 
      }
    }
    
    if (!loading && pagination.totalItems === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, pagination, loading]);

  // Listen for new posts created globally
  useEffect(() => {
    const handlePostCreated = (event: CustomEvent) => {
      const newPost = event.detail;
      if (newPost.status === 'PUBLISHED') {
        // If we're on the first page, add the new post to the beginning
        if (currentPage === 1) {
          setPosts(prevPosts => [newPost, ...prevPosts.slice(0, 1)]); // Keep only 2 posts per page
        }
      }
    };

    window.addEventListener('postCreated', handlePostCreated as EventListener);
    return () => {
      window.removeEventListener('postCreated', handlePostCreated as EventListener);
    };
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getPosts({
        page: currentPage,
        limit: 2, // Exactly 2 posts per page (assessment requirement)
        status: 'PUBLISHED',
      });
      
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = (postId: string) => {
    navigate(`/posts/${postId}`);
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage message={error} onRetry={fetchPosts} />
      </div>
    );
  }

  // Show home page with post listing
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Blogify
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover amazing stories, insights, and perspectives from our vibrant community of writers and thinkers. Now with AI-powered summaries for faster reading!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Reading
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20">
                Join Community
              </button>
            </div>
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-gray-50">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      {/* Small Cool AI Badge */}
      <div className="bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
            <span className="text-white font-medium text-sm">
              ✨ Now with AI Summarization
            </span>
            <span className="text-white/80 text-xs">
              • Powered by Gemini
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-6">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Latest Stories
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Explore our curated collection of thought-provoking articles and stories from our vibrant community of writers and creators.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mx-auto mt-8"></div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No stories available yet
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Be the first to share your story and inspire our community!
            </p>
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Create Your First Story
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-12">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={handlePostClick}
                  onPostUpdated={fetchPosts}
                  onEditPost={(postId) => {
                    setEditingPostId(postId);
                    setIsEditPostModalOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-20">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  hasNext={pagination.hasNextPage}
                  hasPrev={pagination.hasPrevPage}
                />
              </div>
            )}
          </>
        )}

        {/* Enhanced Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 font-medium">
                  {posts.length} stories this page
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-gray-600">
                {pagination.totalItems} total stories
              </span>
              {pagination.totalPages > 1 && (
                <>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span className="text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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