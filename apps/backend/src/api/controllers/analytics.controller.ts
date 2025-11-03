import {
  AnalyticsService,
  LogSummary,
  TimeRange,
} from '../../core/services/analytics.service.js';
import { Request, Response } from 'express';

export class AnalyticsController {
  private readonly analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  public getLogSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.project) {
        console.error('FATAL: req.project missing after authMiddleware.');
        res.status(500).json({
          message: 'Internal Server Error: Authentication context missing.',
        });
        return;
      }

      const timeRangeQuery = req.query.timeRange as string | undefined;
      const allowedTimeRanges = ['24h', '7d', '30d'];
      let timeRange: TimeRange = '24h';

      if (timeRangeQuery) {
        if (!allowedTimeRanges.includes(timeRangeQuery)) {
          res.status(400).json({
            message: 'Invalid timeRange parameter. Must be one of 24h, 7d, 30d',
          });
          return;
        }
        timeRange = timeRangeQuery as TimeRange;
      }

      const projectId = req.project.id;

      const logSummary: LogSummary = await this.analyticsService.getLogSummary(
        projectId,
        timeRange
      );

      res.status(200).json(logSummary);
    } catch (error) {
      console.error('Error in Analytics Controller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getErrorsByHour = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.project) {
        console.error('FATAL: req.project missing after authMiddleware.');
        res.status(500).json({
          message: 'Internal Server Error: Authentication context missing.',
        });
        return;
      }
      const projectId = req.project.id;
      const hourlyErrorCount =
        await this.analyticsService.getErrorsByHour(projectId);
      res.status(200).json(hourlyErrorCount);
    } catch (error) {
      console.error('Error in AnalyticsController (getErrorsByHour)', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public getTopMessages = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.project?.id) {
        console.error('FATAL: req.project missing after authMiddleware');
        res.status(500).json({
          message: 'Internal Server Error: Authentication context missing',
        });
        return;
      }
      let timeRange: TimeRange = '24h';
      const timeRangeQuery = req.query.timeRange as string | undefined;
      const allowedTimeRanges = ['24h', '7d', '30d'];

      if (timeRangeQuery) {
        if (!allowedTimeRanges.includes(timeRangeQuery)) {
          res.status(400).json({
            message: 'Invalid timeRange parameter, must be one of 24h, 7d, 30d',
          });
          return;
        }
        timeRange = timeRangeQuery as TimeRange;
      }

      const allowedLevels = ['info', 'warn', 'error'];
      const level = req.query.level as string | undefined;
      if (level) {
        if (!allowedLevels.includes(level)) {
          res.status(400).json({
            message:
              'Invalid level parameter, muse be one of info, warn, error',
          });
          return;
        }
      } else {
        res.status(400).json({ message: 'Must include level parameter' });
        return;
      }

      let limit = 10;
      const limitQuery = req.query.limit as string | undefined;
      if (limitQuery) {
        const parsedLimit = parseInt(limitQuery, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = parsedLimit;
        }
      }
      const projectId = req.project.id;

      const result = await this.analyticsService.getTopMessages(
        projectId,
        level,
        timeRange,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in AnalyticsController (getTopMessages)', error);
      res.status(500).json({ message: 'Internal Server error' });
    }
  };
}
