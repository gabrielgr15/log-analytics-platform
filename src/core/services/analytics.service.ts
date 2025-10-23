import { AnalyticsRepository } from '../repositories/analytics.repository.js';

export interface LogSummary {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

export interface HourlyErrorCount {
  hour: string;
  errorCount: number;
}

export type TimeRange = '24h' | '7d' | '30d';

export class AnalyticsService {
  private readonly analyticsRepository: AnalyticsRepository;

  constructor(logRepository: AnalyticsRepository) {
    this.analyticsRepository = logRepository;
  }

  public async getLogSummary(
    projectId: string,
    timeRange: TimeRange
  ): Promise<LogSummary> {
    const startDate = this.calculateStartDate(timeRange);
    const [totalLogs, errorCount, warnCount, infoCount] = await Promise.all([
      this.analyticsRepository.countTotalLogs(projectId, startDate),
      this.analyticsRepository.countLogsByLevel(projectId, 'error', startDate),
      this.analyticsRepository.countLogsByLevel(projectId, 'warn', startDate),
      this.analyticsRepository.countLogsByLevel(projectId, 'info', startDate),
    ]);
    return {
      totalLogs,
      errorCount,
      warnCount,
      infoCount,
    };
  }

  public async getErrorsByHour(projectId: string): Promise<HourlyErrorCount[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    const dbResults = await this.analyticsRepository.countErrorsByHour(
      projectId,
      startDate
    );

    const hoursMap = new Map<string, number>();
    const now = new Date();
    now.setMinutes(0, 0, 0);

    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i);
      hoursMap.set(hour.toISOString(), 0);
    }

    for (const result of dbResults) {
      const hourKey = result.hour.toISOString();
      if (hoursMap.has(hourKey)) {
        hoursMap.set(hourKey, result.errorCount);
      }
    }

    const finalResult = Array.from(hoursMap.entries()).map(
      ([hour, errorCount]) => ({
        hour,
        errorCount,
      })
    );

    finalResult.sort(
      (a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime()
    );

    return finalResult;
  }

  private calculateStartDate(timeRange: TimeRange): Date {
    const now = new Date();
    const daysToSubstract = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
    };
    const days = daysToSubstract[timeRange];
    now.setDate(now.getDate() - days);
    return now;
  }
}
