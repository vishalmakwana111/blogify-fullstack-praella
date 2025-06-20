import axios from 'axios';

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

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  postId: string;
  parentId?: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export interface CommentsResponse {
  success: boolean;
  data: {
    data: Comment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

export interface CommentResponse {
  success: boolean;
  data: {
    comment: Comment;
  };
  message?: string;
}

export const commentService = {
  // Get comments for a specific post
  async getPostComments(postId: string, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<CommentsResponse> {
    const response = await api.get(`/comments/post/${postId}`, { params });
    return response.data;
  },

  // Create a new comment
  async createComment(data: {
    content: string;
    postId: string;
    parentId?: string;
  }): Promise<CommentResponse> {
    const response = await api.post('/comments', data);
    return response.data;
  },

  // Update a comment
  async updateComment(commentId: string, data: {
    content: string;
  }): Promise<CommentResponse> {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Get user's own comments
  async getUserComments(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<CommentsResponse> {
    const response = await api.get('/comments/my', { params });
    return response.data;
  },
}; 