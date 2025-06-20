import express from 'express';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import * as tagController from '../controllers/tagController';

const router = express.Router();

// CUID validation function
const isCUID = (value: string): boolean => {
  // CUID format: starts with 'c', 25 characters total, lowercase letters and numbers
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(value);
};

router.get('/', tagController.getTags);

router.post('/', 
  authenticate,
  body('name').isLength({ min: 1, max: 50 }).trim().withMessage('Tag name must be between 1 and 50 characters'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  validate,
  tagController.createTag
);

router.get('/:id', 
  param('id').custom((value) => {
    if (!isCUID(value)) {
      throw new Error('Invalid tag ID');
    }
    return true;
  }),
  validate,
  tagController.getTagById
);

export default router; 