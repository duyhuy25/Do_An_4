import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export interface AuthenticatedUser {
  userId: number;
  roleId: number;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

const authSecret = process.env.AUTH_SECRET || process.env.DB_PASSWORD || 'development-only-secret';

const sign = (payload: string) =>
  crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');

export function createAccessToken(user: { UserID: number; RoleID: number }): string {
  const payload = Buffer.from(JSON.stringify({ userId: user.UserID, roleId: user.RoleID, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

// Authentication is optional on public listings; an invalid token is treated as anonymous.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return next();

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return next();

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return next();

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AuthenticatedUser & { exp: number };
    if (Number.isInteger(data.userId) && Number.isInteger(data.roleId) && data.exp > Date.now()) {
      req.authUser = { userId: data.userId, roleId: data.roleId };
    }
  } catch {
    // Keep the request anonymous when its token cannot be decoded.
  }
  next();
}
