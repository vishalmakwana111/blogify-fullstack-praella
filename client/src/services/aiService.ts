const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AISummaryResponse {
  success: boolean;
  data?: {
    summary: string;
    wordCount: number;
    postTitle: string;
  };
  message?: string;
}

export const aiService = {
  // Generate AI summary for a blog post
  summarizePost: async (postId: string): Promise<AISummaryResponse> => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/ai/summarize/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate summary');
    }

    return data;
  },
}; 