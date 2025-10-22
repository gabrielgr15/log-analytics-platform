// src/api/controllers/log.controller.ts

import { Request, Response } from 'express';
import { LogService, RawLogInput } from '../../core/services/log.service.js';

export class LogController {
  private readonly logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  public ingestLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = req.body as RawLogInput[];

      if (!Array.isArray(logs) || logs.length === 0) {
        res.status(400).json({
          message: 'Bad Request: Log batch must be a non-empty array',
        });
        return;
      }

      if (logs.length > 100) {
        res.status(400).json({
          message: 'Bad Request: Log batch cannot exceed 100 entries',
        });
        return;
      }

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
