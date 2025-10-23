import { PrismaClient, Prisma } from '@prisma/client';

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

  public async countErrorsByHour(
    projectId: string,
    startDate: Date
  ): Promise<{ hour: Date; errorCount: number }[]> {
    const result = await this.prisma.$queryRaw<
      { hour: Date; error_count: bigint }[]
    >(
      Prisma.sql`
        SELECT
            DATE_TRUNC('hour', "timestamp") AS hour,
            count(*) AS error_count
        FROM "Log"
        Where "projectId" = ${projectId}
            AND "level" = 'error'
            AND "timestamp" >= ${startDate}
        GROUP BY hour
        ORDER BY hour ASC;
        `
    );

    return result.map((row) => ({
      hour: row.hour,
      errorCount: Number(row.error_count),
    }));
  }
}
