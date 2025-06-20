import { Request, Response, NextFunction } from 'express'
import { verifyToken, JWTPayload } from '../utils/jwt'
import { prisma } from '../config/database'
import { UserRole } from '@prisma/client'

export interface AuthRequest extends Request {
  user?: JWTPayload & {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      })
      return
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user not found',
      })
      return
    }

    // Add user info to request
    req.user = {
      ...payload,
      id: user.id,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    }

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed',
    })
    return
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      })
      return
    }

    next()
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole([UserRole.ADMIN])(req, res, next)
}

export function requireModerator(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole([UserRole.ADMIN, UserRole.MODERATOR])(req, res, next)
}

// Optional authentication - doesn't fail if no token provided
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next() // Continue without authentication
      return
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (user) {
      req.user = {
        ...payload,
        id: user.id,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      }
    }

    next()
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
} 