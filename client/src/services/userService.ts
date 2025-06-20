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

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  username?: string;
  avatar?: File;
}

export const userService = {
  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<{
    success: boolean;
    message: string;
    data: { user: UserProfile };
  }> {
    const formData = new FormData();
    
    // Append text fields
    if (data.firstName !== undefined) formData.append('firstName', data.firstName);
    if (data.lastName !== undefined) formData.append('lastName', data.lastName);
    if (data.bio !== undefined) formData.append('bio', data.bio);
    if (data.username !== undefined) formData.append('username', data.username);
    
    // Append avatar file if provided
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get user profile (already exists in auth, but included for completeness)
  async getProfile(): Promise<{
    success: boolean;
    data: { user: UserProfile };
  }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },
}; 