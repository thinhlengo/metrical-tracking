import { ExecutionContext } from '@nestjs/common';
import { CheckMessageRetryGuard } from './check-message-retry.guard';

describe('CheckMessageRetryGuard', () => {
  let guard: CheckMessageRetryGuard;

  beforeEach(() => {
    guard = new CheckMessageRetryGuard();
  });

  const createMockContext = (
    retryCount: number | undefined,
    argsLength: number = 2,
  ): { context: ExecutionContext; mockChannel: { ack: jest.Mock, nack: jest.Mock }; mockMessage: object } => {
    const mockMessage = {
      properties: {
        headers: retryCount !== undefined ? { 'x-delivery-count': retryCount } : {},
      },
    };

    const mockChannel = { ack: jest.fn(), nack: jest.fn() };

    const mockRmqContext = {
      getMessage: () => mockMessage,
      getChannelRef: () => mockChannel,
    };

    const args = argsLength >= 2 ? [{}, mockRmqContext] : argsLength === 1 ? [{}] : [];

    const mockExecutionContext = {
      getArgs: () => args,
    } as unknown as ExecutionContext;

    return { context: mockExecutionContext, mockChannel, mockMessage };
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('insufficient args', () => {
    it('should return false when context has less than 2 args', () => {
      const { context } = createMockContext(0, 1);
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false when context has no args', () => {
      const { context } = createMockContext(0, 0);
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('retry count within limit', () => {
    it('should return true when x-delivery-count header is missing (defaults to 0)', () => {
      const { context, mockChannel } = createMockContext(undefined);
      expect(guard.canActivate(context)).toBe(true);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should return true when retry count is 1', () => {
      const { context, mockChannel } = createMockContext(1);
      expect(guard.canActivate(context)).toBe(true);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should return true when retry count is 2', () => {
      const { context, mockChannel } = createMockContext(2);
      expect(guard.canActivate(context)).toBe(true);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });
  });

  describe('retry count exceeded', () => {
    it('should return false and ack message when retry count is 3', () => {
      const { context, mockChannel, mockMessage } = createMockContext(3);
      expect(guard.canActivate(context)).toBe(false);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('should return false and ack message when retry count is greater than 3', () => {
      const { context, mockChannel, mockMessage } = createMockContext(5);
      expect(guard.canActivate(context)).toBe(false);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('should return false and ack message when retry count is 10', () => {
      const { context, mockChannel, mockMessage } = createMockContext(10);
      expect(guard.canActivate(context)).toBe(false);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });
  });
});
