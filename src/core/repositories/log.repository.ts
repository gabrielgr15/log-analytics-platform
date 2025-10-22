// src/core/repositories/log.repository.ts

import { PrismaClient } from '@prisma/client';

export type LogCreateInput = {
  level: string;
  message: string;
  timestamp: Date;
  metadata?: object;
  projectId: string;
};

export class LogRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async createMany(logs: LogCreateInput[]): Promise<void> {
    await this.prisma.log.createMany({
      data: logs,
    });
  }
}
