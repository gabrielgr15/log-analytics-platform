import { PrismaClient } from '@prisma/client';

export class AnalyticsRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async countLogsByLevel(
    projectId: string,
    level: string,
    startDate: Date
  ): Promise<number> {
    const count = await this.prisma.log.count({
      where: {
        projectId: projectId,
        level: level,
        timestamp: {
          gte: startDate,
        },
      },
    });
    return count;
  }

  public async countTotalLogs(
    projectId: string,
    startDate: Date
  ): Promise<number> {
    const count = await this.prisma.log.count({
      where: {
        projectId: projectId,
        timestamp: {
          gte: startDate,
        },
      },
    });
    return count;
  }
}
