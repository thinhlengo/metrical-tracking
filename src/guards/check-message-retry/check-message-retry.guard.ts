import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Channel, Message } from 'amqplib';

@Injectable()
export class CheckMessageRetryGuard implements CanActivate {
  private readonly logger = new Logger(CheckMessageRetryGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const args = context.getArgs();
    if (args.length < 2) {
      return false;
    }

    const originalMsg = args[1].getMessage() as Message;
    const channel = args[1].getChannelRef() as Channel;

    const retryCount = originalMsg.properties.headers['x-delivery-count'] || 0;
    if (retryCount > 2) {
      // TODO: Send message to dead letter queue
      
      this.logger.log('RetryGuard: Message retry count exceeded, acknowledging message.');
      channel.ack(originalMsg);
      return false;
    }

    this.logger.log('RetryGuard: Message retry count not exceeded, allowing message to be processed.');
    return true;
  }
}
