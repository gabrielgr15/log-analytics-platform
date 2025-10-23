import {
  LogRepository,
  LogCreateInput,
} from '../repositories/log.repository.js';
import { RawLogInput } from '../validation/log.schema.js';
import { AlertRepository } from '../repositories/alert.repository.js';

export class LogService {
  private readonly logRepository: LogRepository;
  private readonly alertRepository: AlertRepository;

  constructor(logRepository: LogRepository, alertRepository: AlertRepository) {
    this.logRepository = logRepository;
    this.alertRepository = alertRepository;
  }

  public async logIngest(
    rawLogs: RawLogInput[],
    projectId: string
  ): Promise<void> {
    const processedLogs: LogCreateInput[] = [];

    for (const rawLog of rawLogs) {
      const processedLog = this.processSingleLog(rawLog, projectId);
      processedLogs.push(processedLog);
    }

    await this.logRepository.createMany(processedLogs);
  }

  private processSingleLog(
    rawLog: RawLogInput,
    projectId: string
  ): LogCreateInput {
    const processedLog: LogCreateInput = {
      ...rawLog,
      timestamp: new Date(rawLog.timestamp),
      projectId: projectId,
    };

    processedLog.level = processedLog.level.toLowerCase();

    this.checkForAlerts(processedLog);

    return processedLog;
  }

  private checkForAlerts(processedLog: LogCreateInput): void {
    const isError = processedLog.level === 'error';
    const isCritical = processedLog.message.includes('critical');

    if (isError && isCritical) {
      console.log(
        `ALERT: Critical error detected for project: ${processedLog.projectId}`
      );
      const logAsJson = {
        ...processedLog,
        timestamp: processedLog.timestamp.toISOString(),
      };
      this.alertRepository
        .create({
          logMessage: processedLog.message,
          triggeringLog: logAsJson,
          projectId: processedLog.projectId,
        })
        .catch((err) => {
          console.error('Failed to create alert:', err);
        });
    }
  }
}
