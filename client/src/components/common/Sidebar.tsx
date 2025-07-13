
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MessageCircle, 
  User, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

const navigationItems = [
  {
    name: 'Overview',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'My Posts',
    path: '/dashboard/posts',
    icon: FileText
  },
  {
    name: 'Comments',
    path: '/dashboard/comments',
    icon: MessageCircle
  },
  {
    name: 'Liked Posts',
    path: '/dashboard/liked',
    icon: FileText
  },
  {
    name: 'Saved Posts',
    path: '/dashboard/saved',
    icon: FileText
  },
  {
    name: 'Profile',
    path: '/dashboard/profile',
    icon: User
  }
];

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose, onMobileOpen }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onMobileClose();
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'User';

  return (
    <>
      {/* Mobile Menu Button - Show in header area on mobile */}
      <button
        onClick={onMobileOpen}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-white border-r border-gray-200 shadow-sm flex flex-col h-full
        ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0 w-64' : 'fixed inset-y-0 left-0 z-50 -translate-x-full w-64'}
        lg:relative lg:translate-x-0 lg:z-auto
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        transition-all duration-300 ease-in-out
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Dashboard</h2>
            </div>
          )}
          
          {/* Toggle Button - Desktop */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors hidden lg:block"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>

          {/* Close Button - Mobile */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-2 space-y-1 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onMobileClose()}
                className={`
                  flex items-center px-3 py-2 rounded-md transition-all duration-200
                  group relative text-sm
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className={`
                  ${isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-2'}
                  ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                `} />
                
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-2 border-t border-gray-200 space-y-1 bg-white">
          {/* User Info - Collapsed */}
          {isCollapsed && (
            <div className="flex justify-center mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          )}

          {/* User Info - Expanded */}
          {!isCollapsed && (
            <div className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 mb-2">
              <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{user?.username}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 text-sm
              text-red-600 hover:bg-red-50
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`
              ${isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-2'}
              text-red-500
            `} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
} 