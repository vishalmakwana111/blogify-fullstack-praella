import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus, User, LogOut, Menu, X, PlusCircle, LayoutDashboard } from 'lucide-react';
import { CreatePostModal } from '../CreatePostModal';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-gray-900 leading-tight">
                  Blogify
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">
                  Your Story Matters
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Create Post Button */}
                <button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="hidden md:inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Post
                </button>

                {/* User Profile Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.username || 'User'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        @{user?.username}
                      </div>
                    </div>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user?.firstName && user?.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user?.username || 'User'
                              }
                            </div>
                            <div className="text-sm text-gray-500">@{user?.username}</div>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Guest Navigation */}
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              {isAuthenticated ? (
                <>
                  {/* Mobile Create Post Button */}
                  <button
                    onClick={() => {
                      setIsCreatePostModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-3" />
                    Create Post
                  </button>

                  <div className="px-3 py-3 bg-white rounded-lg mx-1 my-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-base font-medium text-gray-900">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user?.username || 'User'
                          }
                        </div>
                        <div className="text-sm text-gray-500">@{user?.username}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-base font-medium transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5 mr-3" />
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          // Optionally refresh posts or show success message
          console.log('Post created successfully!');
        }}
      />
    </header>
  );
} 