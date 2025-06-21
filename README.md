# 🚀 Blogify - Modern Fullstack Blog Platform

A cutting-edge, full-featured blog platform built with React 19, Express 5, and AI-powered content features.

🎥 **Video Demo**: [Watch Full Application Walkthrough](https://www.loom.com/share/4f2cae82e9384b0b8b0c0acc18ef3734)  
🌐 **Live Demo**: [blogify-fullstack-praella-zzph.vercel.app](https://blogify-fullstack-praella-zzph.vercel.app)  
📦 **Repository**: [github.com/vishalmakwana111/blogify-fullstack-praella](https://github.com/vishalmakwana111/blogify-fullstack-praella)

*I would highly recommend running this application locally to experience the full functionality. The deployed backend on Render has limited memory/CPU resources which may affect performance..*





## ✨ Features

### 🔐 **Authentication System**
- User registration with comprehensive validation
- Login/logout with email or username support
- JWT-based authentication with refresh tokens
- Password change with current password verification

### 📝 **Blog Management**
- Create, edit, and delete blog posts
- Rich text content with title, description, and tags
- Draft and published post states
- Tag system for categorization
- User can only edit/delete their own posts
- Post deletion protected when comments exist

### 💬 **Comment System**
- Nested comment replies with unlimited depth
- Real-time comment count updates
- Comment moderation support
- Guest users prompted to login for commenting
- Users can edit/delete their own comments

### 🏠 **Home Page & Navigation**
- Clean post listing with title, date, author, comment count
- **2 posts per page** with professional pagination (as required)
- Detailed post view on separate pages
- Responsive design for all devices

### 🤖 **AI-Powered Features**
- Google Gemini AI integration for post summarization
- Intelligent 50-word summary generation
- Rate-limited AI endpoints for cost optimization

### 📊 **User Dashboard**
- Personal post management
- User statistics and analytics
- Profile settings with avatar upload
- Comment management interface





## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/vishalmakwana111/blogify-fullstack-praella.git
cd blogify-fullstack-praella
```

### 2. Start Database
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d
```

### 3. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 5. Access the Application
- **Live Demo**: https://blogify-fullstack-praella-zzph.vercel.app
- **Frontend (Development)**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: localhost:5435

## 📋 Requirements Met

✅ **All Core Requirements Implemented:**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| User Registration | ✅ Complete | Full validation, email verification ready |
| Login/Logout | ✅ Complete | Email/username support, JWT tokens |
| Change Password | ✅ Complete | Current password verification |
| Forgot Password | ✅ Complete | Token-based reset system |
| Create Posts | ✅ Complete | Title, date, author, description, tags |
| Edit Own Posts | ✅ Complete | User can only edit their own content |
| Delete Own Posts | ✅ Complete | Protected deletion with comment checks |
| Post Listing | ✅ Complete | Title, date, author, comment count |
| Post Detail Page | ✅ Complete | Separate page for full content |
| **2 Posts Per Page** | ✅ **Perfect** | Exact pagination requirement met |
| Comment System | ✅ Complete | Nested replies, guest login prompts |
| Authentication Guards | ✅ Complete | Protected routes and actions |

## 🔧 Project Setup

### Environment Configuration

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://blogify_user:blogify_password@localhost:5435/blogify_dev"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# Server Configuration
PORT=5000
NODE_ENV="development"

# Security
BCRYPT_ROUNDS="12"
MAX_FILE_SIZE="5242880"

# AI Integration
GOOGLE_API_KEY="your-google-gemini-api-key"
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_PORT=5173
VITE_NODE_ENV=development
```

### Database Schema

The application uses **5 main entities**:

- **Users**: Authentication and profile management
- **Posts**: Blog content with status and metadata  
- **Comments**: Nested comment system
- **Tags**: Categorization system
- **PostTags**: Many-to-many relationship

### Build for Production

#### Backend
```bash
cd server
npm run build
npm start
```

#### Frontend
```bash
cd client
npm run build
npm run preview
```

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register      - User registration
POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
GET    /api/auth/profile       - Get user profile
PUT    /api/auth/profile       - Update user profile
POST   /api/auth/change-password - Change password
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
```

### Post Management
```
GET    /api/posts              - Get posts (2 per page)
POST   /api/posts              - Create new post
GET    /api/posts/:id          - Get post by ID
PUT    /api/posts/:id          - Update post (own only)
DELETE /api/posts/:id          - Delete post (own only)
GET    /api/posts/my/posts     - Get user's posts
GET    /api/posts/my/stats     - Get user statistics
```

### Comment System
```
GET    /api/comments/post/:postId - Get post comments
POST   /api/comments              - Create comment
PUT    /api/comments/:id          - Update comment (own only)
DELETE /api/comments/:id          - Delete comment (own only)
GET    /api/comments/my           - Get user's comments
```

### AI Features
```
POST   /api/ai/summarize/:postId  - Generate AI summary
```

### Tags
```
GET    /api/tags               - Get all tags
POST   /api/tags               - Create new tag
GET    /api/tags/:id           - Get tag with posts
```

## 🤖 AI Integration

The application features **Google Gemini AI** integration for intelligent content enhancement:

- **Smart Summarization**: Automatic 50-word post summaries
- **Rate Limited**: Optimized for cost and performance
- **Error Handling**: Graceful fallbacks for API issues
- **User-Friendly**: Seamless integration in the UI

---

## 🎯 Assessment Summary

**✅ All Requirements Met**
- Complete authentication system
- Full post management with proper permissions
- Nested comment system
- Exact 2-post pagination as specified
- Clean, professional UI/UX
- Modern technology stack
- Production-ready code quality

**🚀 Bonus Features Added**
- AI-powered content enhancement
- Advanced security measures
- Professional deployment setup
- Comprehensive documentation

---

*Built with ❤️ for praella*