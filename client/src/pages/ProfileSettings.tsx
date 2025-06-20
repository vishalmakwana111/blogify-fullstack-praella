import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { Camera, Save, Loader, User } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    username: '',
    email: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        username: user.username || '',
        email: user.email || '',
      });
      setPreviewUrl(user.avatar || '');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        setMessageType('error');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        setMessageType('error');
        return;
      }

      setAvatar(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        username: formData.username,
      };

      if (avatar) {
        updateData.avatar = avatar;
      }

      const response = await userService.updateProfile(updateData);
      updateUser(response.data.user);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      
      // Clear avatar file after successful upload
      setAvatar(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner className="mx-auto" />;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 min-h-0 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md flex-1 min-h-0 flex flex-col">
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-display font-bold">Profile Settings</h1>
            <p className="text-gray-600 text-sm">Update your profile information and preferences</p>
          </div>

          <div className="flex-1 p-3">
            <form onSubmit={handleSubmit} className="space-y-3 h-full flex flex-col">
              {/* Avatar Upload */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
                    <Camera className="w-2.5 h-2.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Profile Photo</h3>
                  <p className="text-xs text-gray-500">
                    Upload a photo. Max size: 5MB
                  </p>
                  {avatar && (
                    <p className="text-xs text-green-600">
                      New: {avatar.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Choose username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  disabled
                  title="Email cannot be changed"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Message */}
              {message && (
                <div className={`p-2 rounded-md text-sm ${
                  messageType === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 