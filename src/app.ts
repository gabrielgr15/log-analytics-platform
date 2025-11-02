// src/app.ts

import express from 'express';
import prisma from './lib/prisma.js';

import { LogRepository } from './core/repositories/log.repository.js';
import { AlertRepository } from './core/repositories/alert.repository.js';
import { AnalyticsRepository } from './core/repositories/analytics.repository.js';
import { UserRepository } from './core/repositories/user.repository.js';

import { LogService } from './core/services/log.service.js';
import { AnalyticsService } from './core/services/analytics.service.js';
import { AuthService } from './core/services/auth.service.js';

import { LogController } from './api/controllers/log.controller.js';
import { AnalyticsController } from './api/controllers/analytics.controller.js';
import { AuthController } from './api/controllers/auth.controller.js';

import { apiKeyAuthMiddleware } from './middleware/auth.js';

const logRepository = new LogRepository(prisma);
const alertRepository = new AlertRepository(prisma);
const analyticsRepository = new AnalyticsRepository(prisma);
const userRepository = new UserRepository(prisma);

const logService = new LogService(logRepository, alertRepository);
const analyticsService = new AnalyticsService(analyticsRepository);
const authService = new AuthService(userRepository);

const logController = new LogController(logService);
const analyticsController = new AnalyticsController(analyticsService);
const authController = new AuthController(authService);

const app = express();
app.use(express.json());

const authRouter = express.Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

const v1Router = express.Router();
v1Router.use(apiKeyAuthMiddleware);

v1Router.post('/logs', logController.ingestLogs);
v1Router.get('/analytics/summary', analyticsController.getLogSummary);
v1Router.get('/analytics/errors-by-hour', analyticsController.getErrorsByHour);
v1Router.get('/analytics/top-messages', analyticsController.getTopMessages);

app.use('/api/auth', authRouter);
app.use('/v1', v1Router);

export default app;
