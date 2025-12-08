import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { AllConfigType } from 'src/configurate/config.type';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {

  private readonly logger = new Logger(RateLimitMiddleware.name);

  private readonly redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD,
  });
  
  private readonly rateLimiter = new RateLimiterRedis({
    storeClient: this.redisClient,
    keyPrefix: 'middleware',
    points: 100,
    duration: 60,
  });

  async use(req: any, res: any, next: () => void) {
    try {
      const result = await this.rateLimiter.consume(req.ip);
      this.logger.log(`Rate limit result: ${JSON.stringify(result)}`);
      next();
    } catch (err) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
