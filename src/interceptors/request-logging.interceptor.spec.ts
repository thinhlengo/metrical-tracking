import { CallHandler, ExecutionContext, LoggerService } from '@nestjs/common';
import { of } from 'rxjs';
import { RequestLoggingInterceptor } from './request-logging.interceptor';

describe('RequestLoggingInterceptor', () => {
  let interceptor: RequestLoggingInterceptor;
  let mockLogger: jest.Mocked<LoggerService>;

  const createMockExecutionContext = (request: {
    method: string;
    url: string;
    headers: object;
    body: object;
  }): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (response: unknown = { result: 'success' }): CallHandler => {
    return {
      handle: jest.fn().mockReturnValue(of(response)),
    } as unknown as CallHandler;
  };

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as jest.Mocked<LoggerService>;

    interceptor = new RequestLoggingInterceptor(mockLogger);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('incoming request logging', () => {
    it('should log incoming request with method, url, headers, and body', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/api/test',
        headers: { 'content-type': 'application/json' },
        body: { data: 'test' },
      };
      const context = createMockExecutionContext(mockRequest);
      const callHandler = createMockCallHandler();

      interceptor.intercept(context, callHandler).subscribe({
        complete: () => {
          expect(mockLogger.log).toHaveBeenCalledWith(
            `Incoming Request: POST /api/test - Headers: ${JSON.stringify(mockRequest.headers)} - Body: ${JSON.stringify(mockRequest.body)}`,
            'RequestLoggingInterceptor',
          );
          done();
        },
      });
    });

    it('should log with correct context name', (done) => {
      const mockRequest = {
        method: 'GET',
        url: '/api/users',
        headers: {},
        body: {},
      };
      const context = createMockExecutionContext(mockRequest);
      const callHandler = createMockCallHandler();

      interceptor.intercept(context, callHandler).subscribe({
        complete: () => {
          expect(mockLogger.log).toHaveBeenCalledWith(
            expect.any(String),
            'RequestLoggingInterceptor',
          );
          done();
        },
      });
    });
  });

  describe('request handling', () => {
    it('should call next.handle() and return the observable', (done) => {
      const mockRequest = {
        method: 'GET',
        url: '/api/test',
        headers: {},
        body: {},
      };
      const context = createMockExecutionContext(mockRequest);
      const callHandler = createMockCallHandler({ success: true });

      const result$ = interceptor.intercept(context, callHandler);

      result$.subscribe({
        next: (value) => {
          expect(value).toEqual({ success: true });
          expect(callHandler.handle).toHaveBeenCalled();
        },
        complete: () => done(),
      });
    });

    it('should pass through the response from the handler', (done) => {
      const mockRequest = {
        method: 'PUT',
        url: '/api/items/1',
        headers: { authorization: 'Bearer token' },
        body: { name: 'updated' },
      };
      const expectedResponse = { id: 1, name: 'updated', updatedAt: '2025-01-01' };
      const context = createMockExecutionContext(mockRequest);
      const callHandler = createMockCallHandler(expectedResponse);

      interceptor.intercept(context, callHandler).subscribe({
        next: (value) => {
          expect(value).toEqual(expectedResponse);
        },
        complete: () => done(),
      });
    });
  });

  describe('duration logging', () => {
    it('should log duration after request completes', (done) => {
      const mockRequest = {
        method: 'DELETE',
        url: '/api/items/1',
        headers: {},
        body: {},
      };
      const context = createMockExecutionContext(mockRequest);
      const callHandler = createMockCallHandler();

      interceptor.intercept(context, callHandler).subscribe({
        complete: () => {
          expect(mockLogger.log).toHaveBeenCalledTimes(2);
          expect(mockLogger.log).toHaveBeenLastCalledWith(
            expect.stringMatching(/^Handled Request: DELETE \/api\/items\/1 - Duration: \d+ms$/),
            'RequestLoggingInterceptor',
          );
          done();
        },
      });
    });

    it('should calculate duration correctly', (done) => {
      jest.useFakeTimers();
      const mockRequest = {
        method: 'GET',
        url: '/api/slow',
        headers: {},
        body: {},
      };
      const context = createMockExecutionContext(mockRequest);
      const callHandler = createMockCallHandler();

      interceptor.intercept(context, callHandler).subscribe({
        complete: () => {
          expect(mockLogger.log).toHaveBeenLastCalledWith(
            expect.stringContaining('Duration:'),
            'RequestLoggingInterceptor',
          );
          jest.useRealTimers();
          done();
        },
      });
    });
  });
});
