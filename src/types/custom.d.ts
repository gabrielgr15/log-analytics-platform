import { Project } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      project?: Project;
    }
  }
}

export {};
