import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import * as commentController from '../controllers/commentController';

const router = express.Router();

// CUID validation function
const isCUID = (value: string): boolean => {
  // CUID format: starts with 'c', 25 characters total, lowercase letters and numbers
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(value);
};

// Public routes
router.get('/post/:postId', [
  param('postId').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid post ID');
    }
    return true;
  }),
  validate,
], commentController.getPostComments);

// Protected routes
router.post('/', authenticate, [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters')
    .trim(),
  body('postId')
    .custom((value) => {
      if (!isCUID(value)) {
        throw new Error('Invalid post ID');
      }
      return true;
    }),
  body('parentId')
    .optional()
    .custom((value) => {
      if (value && !isCUID(value)) {
        throw new Error('Invalid parent comment ID');
      }
      return true;
    }),
  validate,
], commentController.createComment);

router.get('/my', authenticate, commentController.getUserComments);

router.put('/:id', authenticate, [
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid comment ID');
    }
    return true;
  }),
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters')
    .trim(),
  validate,
], commentController.updateComment);

router.delete('/:id', authenticate, [
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid comment ID');
    }
    return true;
  }),
  validate,
], commentController.deleteComment);

export default router; 