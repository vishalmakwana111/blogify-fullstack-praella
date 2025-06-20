import axios from 'axios';
import type { PostsResponse, PostResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const postService = {
  // Get all posts with pagination and filters
  async getPosts(params: {
    page?: number;
    limit?: number;
    tag?: string;
    search?: string;
    status?: string;
  } = {}): Promise<PostsResponse> {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post by ID (alias for getPostById)
  async getPost(id: string): Promise<PostResponse> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Get single post by ID
  async getPostById(id: string): Promise<PostResponse> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Create new post
  async createPost(postData: FormData | any): Promise<PostResponse> {
    const isFormData = postData instanceof FormData;
    const response = await api.post('/posts', postData, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data',
      } : {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Update post
  async updatePost(id: string, postData: FormData | any): Promise<PostResponse> {
    const isFormData = postData instanceof FormData;
    const response = await api.put(`/posts/${id}`, postData, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data',
      } : {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Delete post
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Get user's own posts
  async getMyPosts(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PostsResponse> {
    const response = await api.get('/posts/my/posts', { params });
    return response.data;
  },

  // Get user statistics
  async getUserStats(): Promise<{
    success: boolean;
    data: {
      totalPosts: number;
      publishedPosts: number;
      draftPosts: number;
      totalViews: number;
      totalComments: number;
    };
  }> {
    const response = await api.get('/posts/my/stats');
    return response.data;
  },

  // Get all tags
  async getTags(): Promise<{ success: boolean; data: { tags: any[] } }> {
    const response = await api.get('/tags');
    return response.data;
  },

  // Create new tag
  async createTag(tagData: { name: string; color: string }): Promise<{ success: boolean; message: string; data: { tag: any } }> {
    const response = await api.post('/tags', tagData);
    return response.data;
  },
}; 