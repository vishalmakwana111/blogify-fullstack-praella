import { Router } from 'express'
import {
  register,
  login,
  getProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  logout,
  updateProfile
} from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { authLimiter, registrationLimiter, passwordResetLimiter } from '../middleware/rateLimiter'
import { uploadPostImage } from '../middleware/upload'

const router = Router()

// Public routes (rate limiting temporarily disabled for testing)
router.post('/register', /* registrationLimiter, */ register)
router.post('/login', /* authLimiter, */ login)
router.post('/forgot-password', /* passwordResetLimiter, */ requestPasswordReset)
router.post('/reset-password', /* passwordResetLimiter, */ resetPassword)

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, uploadPostImage.single('avatar'), updateProfile)
router.post('/change-password', authenticate, changePassword)
router.post('/logout', authenticate, logout)

export default router 