import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Missing or invalid API key format' });
    }
    const receivedKey = authHeader.split(' ')[1];
    if (!receivedKey) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: API key is missing' });
    }
    const project = await prisma.project.findUnique({
      where: { apiKey: receivedKey },
    });
    if (!project) {
      return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }
    req.project = project;
    next();
  } catch (error) {
    console.error('Error in authentication middleware', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
