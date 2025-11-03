// src/api/controllers/log.controller.ts

import { Request, Response } from 'express';
import { LogService } from '../../core/services/log.service.js';
import { logBatchSchema } from '../../core/validation/log.schema.js';

export class LogController {
  private readonly logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  public ingestLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = logBatchSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          message: 'Bad Request: Invalid log batch format.',
          errors: validationResult.error.issues,
        });
        return;
      }

      const logs = validationResult.data;

      if (!req.project) {
        console.error('FATAL: req.project missing after authMiddleware.');
        res.status(500).json({
          message: 'Internal Server Error: Authentication context missing.',
        });
        return;
      }

      const projectId = req.project.id;

      await this.logService.logIngest(logs, projectId);

      res.status(202).json({ message: 'Logs accepted for processing' });
    } catch (error) {
      console.error('Error in LogController:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
