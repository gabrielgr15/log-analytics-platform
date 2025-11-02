import { Project, User } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      project?: Project;
      user?: Omit<User, 'password'>;
    }
  }
}

export {};
