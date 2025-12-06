import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { LoggerService } from './logger.service';

export class TypeOrmCustomLogger implements TypeOrmLogger {
  constructor(private readonly logger: LoggerService) {}

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.log(`Query: ${query}`);
    if (parameters) {
      this.logger.log(`Parameters: ${JSON.stringify(parameters)}`);
    }
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    this.logger.error(`Query Failed: ${query}`);
    this.logger.error(`Error: ${error}`);
    if (parameters) {
      this.logger.error(`Parameters: ${JSON.stringify(parameters)}`);
    }
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    this.logger.warn(`Slow Query (${time}ms): ${query}`);
    if (parameters) {
      this.logger.warn(`Parameters: ${JSON.stringify(parameters)}`);
    }
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`Schema Build: ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        this.logger.log(message);
        break;
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }
}
