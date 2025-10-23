import request from 'supertest';
import { randomBytes } from 'crypto';
import prisma from '../lib/prisma.js';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../app.js';
import { Project } from '@prisma/client';

describe('POST /v1/logs - Ingestion Endpoint', () => {
  let testProject: Project;

  beforeEach(async () => {
    testProject = await prisma.project.create({
      data: {
        name: `Test Project ${new Date().getTime()}`,
        apiKey: randomBytes(24).toString('hex'),
      },
    });
  });

  it('should accept a valid batch of logs and return 202', async () => {
    const logBatch = [
      {
        level: 'info',
        message: 'Integration test log entry',
        timestamp: new Date().toISOString(),
      },
    ];

    const response = await request(app)
      .post('/v1/logs')
      .set('Authorization', `Bearer ${testProject.apiKey}`)
      .send(logBatch);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ message: 'Logs accepted for processing' });

    const logsInDb = await prisma.log.findMany({
      where: { projectId: testProject.id },
    });

    expect(logsInDb).toHaveLength(1);
    expect(logsInDb[0].message).toBe('Integration test log entry');
    expect(logsInDb[0].level).toBe('info');
  });

  it('should reject requests with an invalid API key and return 401', async () => {
    const logBatch = [
      { level: 'info', message: 'test', timestamp: new Date().toISOString() },
    ];

    const response = await request(app)
      .post('/v1/logs')
      .set('Authorization', `Bearer invalid-api-key`)
      .send(logBatch);

    expect(response.status).toBe(401);

    const logsInDbCount = await prisma.log.count({
      where: { projectId: testProject.id },
    });
    expect(logsInDbCount).toBe(0);
  });

  it('should reject a batch with more than 100 logs and return 400', async () => {
    const largeLogBatch = Array.from({ length: 101 }, (_, i) => ({
      level: 'info',
      message: `Log ${i}`,
      timestamp: new Date().toISOString(),
    }));

    const response = await request(app)
      .post('/v1/logs')
      .set('Authorization', `Bearer ${testProject.apiKey}`)
      .send(largeLogBatch);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('cannot exceed 100 entries');

    const logsInDbCount = await prisma.log.count({
      where: { projectId: testProject.id },
    });
    expect(logsInDbCount).toBe(0);
  });
});
