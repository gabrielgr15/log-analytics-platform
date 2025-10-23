import { AnalyticsRepository } from '../repositories/analytics.repository.js';

export interface LogSummary {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
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
