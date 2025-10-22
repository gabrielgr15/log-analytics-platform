import {
  LogRepository,
  LogCreateInput,
} from '../repositories/log.repository.js';

export interface RawLogInput {
  level: string;
  message: string;
  timestamp: string;
  metadata?: object;
}

export class LogService {
  private readonly logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  public async logIngest(
    rawLogs: RawLogInput[],
    projectId: string
  ): Promise<void> {
    const logsToCreate: LogCreateInput[] = rawLogs.map((log) => ({
      ...log,
      timestamp: new Date(log.timestamp),
      projectId: projectId,
    }));

    await this.logRepository.createMany(logsToCreate);
  }
}
