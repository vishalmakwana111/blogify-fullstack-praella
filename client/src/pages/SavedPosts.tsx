import { useState, useEffect } from 'react';
import { postService } from '../services/postService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { Post } from '../types';

export function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getSavedPosts();
      setSavedPosts(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch saved posts');
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
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Saved Posts</h1>
        <p className="text-gray-600 mt-1">All posts you have saved will appear here.</p>
      </div>
      <div className="flex-1 min-h-0">
        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts yet</h3>
              <p className="text-gray-600">Posts you save will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">All Saved Posts</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {savedPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gray-50">
                    <h3 className="text-base font-medium text-gray-900 mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>By {post.author?.username || 'Unknown'}</span>
                      <span>Likes: {post.likeCount}</span>
                      <span>Comments: {post._count?.comments ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 