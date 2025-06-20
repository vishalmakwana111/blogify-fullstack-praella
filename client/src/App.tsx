// Clean App.tsx for testing Tailwind CSS v4+
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/common/DashboardLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { CreatePost } from './pages/CreatePost';
import { EditPost } from './pages/EditPost';
import { Dashboard } from './pages/Dashboard';
import { ProfileSettings } from './pages/ProfileSettings';
import { MyPosts } from './pages/MyPosts';
import { MyComments } from './pages/MyComments';
import { PostDetail } from './pages/PostDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          
          {/* Authentication routes - redirect to home if already authenticated */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes for post management */}
          <Route 
            path="/posts/create" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/posts/:id/edit" 
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard routes with layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<MyPosts />} />
            <Route path="comments" element={<MyComments />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
