// src/app.ts

import express from 'express';
import prisma from './lib/prisma.js';

import { LogRepository } from './core/repositories/log.repository.js';
import { AlertRepository } from './core/repositories/alert.repository.js';
import { AnalyticsRepository } from './core/repositories/analytics.repository.js';

import { LogService } from './core/services/log.service.js';
import { AnalyticsService } from './core/services/analytics.service.js';

import { LogController } from './api/controllers/log.controller.js';
import { AnalyticsController } from './api/controllers/analytics.controller.js';

import { authMiddleware } from './middleware/auth.js';

const logRepository = new LogRepository(prisma);
const alertRepository = new AlertRepository(prisma);
const analyticsRepository = new AnalyticsRepository(prisma);

const logService = new LogService(logRepository, alertRepository);
const analyticsService = new AnalyticsService(analyticsRepository);

const logController = new LogController(logService);
const analyticsController = new AnalyticsController(analyticsService);

const app = express();
app.use(express.json());

const apiRouter = express.Router();

apiRouter.use(authMiddleware);

apiRouter.post('/logs', logController.ingestLogs);
apiRouter.get('/analytics/summary', analyticsController.getLogSummary);
apiRouter.get('/analytics/errors-by-hour', analyticsController.getErrorsByHour);

app.use('/v1', apiRouter);

export default app;
