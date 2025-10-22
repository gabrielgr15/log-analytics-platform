// src/index.ts

import express from 'express';
import prisma from './lib/prisma.js';
import { authMiddleware } from './middleware/auth.js';

import { LogRepository } from './core/repositories/log.repository.js';
import { LogService } from './core/services/log.service.js';
import { LogController } from './api/controllers/log.controller.js';

const app = express();
const PORT = process.env.PORT || 3000;

const logRepository = new LogRepository(prisma);
const logService = new LogService(logRepository);
const logController = new LogController(logService);

app.use(express.json());

const apiRouter = express.Router();

apiRouter.post('/logs', authMiddleware, logController.ingestLogs);
app.use('/v1', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
