import express from 'express';
import * as aiController from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for AI endpoints - more restrictive due to API costs
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 10 AI requests per windowMs
  message: {
    success: false,
    message: 'Too many AI requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting and authentication to all AI routes
router.use(aiRateLimit);
router.use(authenticate);

// POST /api/ai/summarize/:postId - Generate AI summary for a blog post
router.post('/summarize/:postId', aiController.summarizePost);

export default router; 