import {
  CallHandler,
  ExecutionContext,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, body } = request;

    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - Headers: ${JSON.stringify(
        headers,
      )} - Body: ${JSON.stringify(body)}`,
      'RequestLoggingInterceptor',
    );

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.logger.log(
          `Handled Request: ${method} ${url} - Duration: ${duration}ms`,
          'RequestLoggingInterceptor',
        );
      }),
    );
  }
}
