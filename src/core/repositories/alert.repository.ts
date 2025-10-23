// src/core/repositories/alert.repository.ts

import { Prisma, PrismaClient } from '@prisma/client';

export type AlertCreateInput = {
  logMessage: string;
  triggeringLog: Prisma.JsonObject;
  projectId: string;
};

export class AlertRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async create(alert: AlertCreateInput): Promise<void> {
    await this.prisma.alert.create({
      data: alert,
    });
  }
}
