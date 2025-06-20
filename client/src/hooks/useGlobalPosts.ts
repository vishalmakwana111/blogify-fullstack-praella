import { useCallback } from 'react';
import { usePostStore } from '../stores/postStore';
import { postService } from '../services/postService';
import type { Post } from '../types';

export function useGlobalPosts() {
  const {
    posts,
    addPost,
    updatePost,
    removePost,
    setPosts,
    setLoading,
    setError,
    loading,
    error
  } = usePostStore();

  // Add a new post to the global state
  const addNewPost = useCallback((post: Post) => {
    addPost(post);
    
    // Trigger a custom event for components that need to know about new posts
    window.dispatchEvent(new CustomEvent('postCreated', { detail: post }));
  }, [addPost]);

  // Update an existing post in global state
  const updateExistingPost = useCallback((postId: string, updates: Partial<Post>) => {
    updatePost(postId, updates);
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('postUpdated', { detail: { postId, updates } }));
  }, [updatePost]);

  // Remove a post from global state
  const removeExistingPost = useCallback((postId: string) => {
    removePost(postId);
    
    // Trigger delete event
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId } }));
  }, [removePost]);

  // Refresh all posts (useful for initial loads and manual refreshes)
  const refreshPosts = useCallback(async (params: {
    page?: number;
    limit?: number;
    tag?: string;
    search?: string;
    status?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getPosts(params);
      setPosts(response.data.data);
      
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch posts';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPosts, setLoading, setError]);

  // Get posts for specific user (My Posts)
  const refreshMyPosts = useCallback(async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getMyPosts(params);
      const myPosts = response.data.data;
      
      // Update only the posts that belong to the current user in global state
      const otherUserPosts = posts.filter((post: Post) => 
        !myPosts.some((myPost: Post) => myPost.id === post.id)
      );
      setPosts([...myPosts, ...otherUserPosts]);
      
      return myPosts;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch posts';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPosts, setLoading, setError]);

  return {
    // State
    posts,
    loading,
    error,
    
    // Actions
    addNewPost,
    updateExistingPost,
    removeExistingPost,
    refreshPosts,
    refreshMyPosts,
  };
} 