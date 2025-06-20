import { create } from 'zustand';

// Post interface definition (matching the API response)
interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  status: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  postTags: Array<{
    tag: {
      id: string;
      name: string;
      color?: string;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  setPosts: (posts: Post[]) => void;
  setCurrentPost: (post: Post | null) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<PostState['pagination']>) => void;
  clearPosts: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 2, // As per assessment requirement
    total: 0,
    totalPages: 0,
  },

  setPosts: (posts) => set({ posts }),
  setCurrentPost: (currentPost) => set({ currentPost }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updates) => set((state) => ({
    posts: state.posts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ),
    currentPost: state.currentPost?.id === postId 
      ? { ...state.currentPost, ...updates } 
      : state.currentPost
  })),
  removePost: (postId) => set((state) => ({
    posts: state.posts.filter(post => post.id !== postId),
    currentPost: state.currentPost?.id === postId ? null : state.currentPost
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  clearPosts: () => set({ posts: [], currentPost: null }),
})); 