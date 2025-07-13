import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { uploadPostImage } from '../middleware/upload';
import * as postController from '../controllers/postController';

const router = express.Router();

// CUID validation function
const isCUID = (value: string): boolean => {
  // CUID format: starts with 'c', 25 characters total, lowercase letters and numbers
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(value);
};

// Public routes
router.get('/', optionalAuthenticate, postController.getPosts);

// Protected routes - more specific routes first
router.get('/my/posts', authenticate, postController.getUserPosts);
router.get('/my/stats', authenticate, postController.getUserStats);
router.get('/liked', authenticate, postController.getLikedPosts);

router.post('/', 
  authenticate, 
  uploadPostImage.single('coverImage'), 
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('content').isLength({ min: 1 }),
  body('excerpt').optional().isLength({ max: 300 }),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  validate,
  postController.createPost
);

router.put('/:id', 
  authenticate, 
  uploadPostImage.single('coverImage'), 
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid post ID');
    }
    return true;
  }),
  body('title').optional().isLength({ min: 1, max: 200 }).trim(),
  body('content').optional().isLength({ min: 1 }),
  body('excerpt').optional().isLength({ max: 300 }),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
  validate,
  postController.updatePost
);

router.delete('/:id', 
  authenticate, 
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid post ID');
    }
    return true;
  }),
  validate,
  postController.deletePost
);

// Like a post
router.post('/:id/like', 
  authenticate,
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid post ID');
    }
    return true;
  }),
  validate,
  postController.likePost
);

// Unlike a post
router.delete('/:id/like', 
  authenticate,
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid post ID');
    }
    return true;
  }),
  validate,
  postController.unlikePost
);

// Save a post
router.post('/:id/save', authenticate, postController.savePost);
// Unsave a post
router.delete('/:id/save', authenticate, postController.unsavePost);
// Get all saved posts for the current user
router.get('/saved', authenticate, postController.getSavedPosts);

// Public route with dynamic parameter - must be last
router.get('/:id', optionalAuthenticate, postController.getPostById);

export default router; 