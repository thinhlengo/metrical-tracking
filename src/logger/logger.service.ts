import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level.toUpperCase()}] ${message}`;
        }),
      ),
      transports: [
        new winston.transports.File({
          filename: 'logs/app.log',
        }),
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
        }),
        new winston.transports.Console(),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(`${context ? `[${context}] ` : ''}${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(`${context ? `[${context}] ` : ''}${message} \n${trace}`);
  }

  warn(message: string, context?: string) {
    this.logger.warn(`${context ? `[${context}] ` : ''}${message}`);
  }

  debug(message: string, context?: string) {
    this.logger.debug(`${context ? `[${context}] ` : ''}${message}`);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(`${context ? `[${context}] ` : ''}${message}`);
  }
}
