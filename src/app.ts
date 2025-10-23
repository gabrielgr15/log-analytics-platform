// src/index.ts

import express from 'express';
import prisma from './lib/prisma.js';

import { authMiddleware } from './middleware/auth.js';
import { LogRepository } from './core/repositories/log.repository.js';
import { AlertRepository } from './core/repositories/alert.repository.js';
import { LogService } from './core/services/log.service.js';
import { LogController } from './api/controllers/log.controller.js';

const logRepository = new LogRepository(prisma);
const alertRepository = new AlertRepository(prisma);
const logService = new LogService(logRepository, alertRepository);
const logController = new LogController(logService);

const app = express();

app.use(express.json());

const apiRouter = express.Router();
apiRouter.post('/logs', authMiddleware, logController.ingestLogs);
app.use('/v1', apiRouter);

export default app;
