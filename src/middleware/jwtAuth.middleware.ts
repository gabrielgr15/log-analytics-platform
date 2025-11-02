import { Request, Response, NextFunction } from 'express';
import { UserRepository } from 'src/core/repositories/user.repository.js';
import jwt from 'jsonwebtoken';

export const jwtAuthMiddleware = (userRepositroy: UserRepository) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.session;

    if (!token)
      return res.status(401).json({ message: 'Authentication required' });
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT secret is not configured.');
      }
      const payload = jwt.verify(token, secret) as { userId: string };

      const user = await userRepositroy.findUserById(payload.userId);

      if (!user) return res.status(401).json({ message: 'User not found' });

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};
