import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/postService';
import { Modal } from './common/Modal';
import { Send, Tag, Plus } from 'lucide-react';
import { useGlobalPosts } from '../hooks/useGlobalPosts';
import type { Post } from '../types';

interface TagOption {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  onPostUpdated?: () => void;
}

export function EditPostModal({ isOpen, onClose, postId, onPostUpdated }: EditPostModalProps) {
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
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [message, setMessage] = useState('');
  const [originalPost, setOriginalPost] = useState<Post | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { updateExistingPost } = useGlobalPosts();

  useEffect(() => {
    if (isOpen && postId && isAuthenticated) {
      Promise.all([fetchPost(), fetchTags()]);
    }
  }, [isOpen, postId, isAuthenticated]);

  const fetchPost = async () => {
    if (!postId) return;
    
    try {
      setIsLoadingPost(true);
      const response = await postService.getPost(postId);
      const post = response.data.post;

      // Check if user owns this post
      if (post.author.id !== user?.id) {
        setMessage('You do not have permission to edit this post');
        return;
      }

      setOriginalPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        tags: post.postTags.map((pt: any) => pt.tag.id),
        status: (post.status as 'DRAFT' | 'PUBLISHED'),
      });
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to load post');
    } finally {
      setIsLoadingPost(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await postService.getTags();
      setAvailableTags(response.data.tags || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setAvailableTags([]);
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
        color: '#3B82F6'
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

    if (!validateForm() || !postId) {
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

      const response = await postService.updatePost(postId, submitData);

      if (response.success) {
        // Update the post in global state for instant visibility
        if (originalPost) {
          const updatedPost = {
            ...originalPost,
            ...submitData,
            updatedAt: new Date().toISOString(),
            postTags: formData.tags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return { tag: tag || { id: tagId, name: 'Unknown', color: '#gray' } };
            })
          };
          updateExistingPost(postId, updatedPost);
        }
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          tags: [],
          status: 'DRAFT'
        });
        setErrors({});
        setMessage('');
        
        if (onPostUpdated) {
          onPostUpdated();
        }
        onClose();
      } else {
        setMessage('Failed to update post');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      status: 'DRAFT'
    });
    setErrors({});
    setMessage('');
    setOriginalPost(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Post"
      size="xl"
    >
      <div className="p-6">
        {isLoadingPost ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-700">{message}</div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className={`w-full px-4 py-3 border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder="What's your story about?"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                required
                className={`w-full px-4 py-3 border ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors`}
                placeholder="Share your thoughts..."
                value={formData.content}
                onChange={handleChange}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
                <span className="text-gray-500 text-xs ml-1">(optional)</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                className={`w-full px-4 py-3 border ${
                  errors.excerpt ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors`}
                placeholder="Brief description of your post..."
                value={formData.excerpt}
                onChange={handleChange}
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              
              {/* Available Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                      formData.tags.includes(tag.id)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>

              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Create new tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                />
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={formData.status === 'DRAFT'}
                    onChange={handleChange}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Draft</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="PUBLISHED"
                    checked={formData.status === 'PUBLISHED'}
                    onChange={handleChange}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Update Post
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
} 