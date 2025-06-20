import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/postService';


interface TagOption {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [] as string[],
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  });
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTags();
  }, [isAuthenticated, navigate]);

  const fetchTags = async () => {
    try {
      const response = await postService.getTags();
      setAvailableTags(response.data.tags || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setAvailableTags([]); // Set empty array on error
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await postService.createTag({
        name: newTagName.trim(),
        color: '#3B82F6' // Default blue color
      });
      
      const newTag = response.data.tag;
      setAvailableTags(prev => [...prev, newTag]);
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.id]
      }));
      setNewTagName('');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create tag');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        tags: formData.tags,
        status: formData.status
      };

      const response = await postService.createPost(submitData);

      if (response.data.success) {
        navigate('/');
      } else {
        setMessage(response.data.message || 'Failed to create post');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600 mt-1 text-sm">Share your thoughts with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {message && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{message}</div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="What's on your mind?"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                required
                className={`w-full px-3 py-2 border ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-y`}
                placeholder="Share your thoughts..."
                value={formData.content}
                onChange={handleChange}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              
              {/* Existing Tags */}
              {availableTags && availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(availableTags || []).slice(0, 6).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        formData.tags.includes(tag.id)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  setFormData(prev => ({ ...prev, status: 'DRAFT' }));
                  setTimeout(() => {
                    const form = (e.target as HTMLElement).closest('form');
                    if (form) form.requestSubmit();
                  }, 0);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {isLoading && formData.status === 'DRAFT' ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  setFormData(prev => ({ ...prev, status: 'PUBLISHED' }));
                  setTimeout(() => {
                    const form = (e.target as HTMLElement).closest('form');
                    if (form) form.requestSubmit();
                  }, 0);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading && formData.status === 'PUBLISHED' ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 