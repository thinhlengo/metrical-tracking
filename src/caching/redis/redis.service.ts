import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export type RedisLockOptions = {
  ttlMs?: number;
  retryDelayMs?: number;
  maxRetries?: number;
};

export type RedisLock = {
  key: string;
  value: string;
};

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async acquire(
    key: string,
    {
      ttlMs = 5000,
      retryDelayMs = 100,
      maxRetries = 20,
    }: RedisLockOptions = {},
  ): Promise<RedisLock | null> {
    const value = uuidv4();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await this.redis.set(key, value, 'PX', ttlMs, 'NX');

      if (result === 'OK') {
        return { key, value };
      }

      if (attempt === maxRetries) {
        break;
      }

      await this.sleep(retryDelayMs);
    }

    this.logger.debug(`Failed to acquire lock for key=${key}`);
    return null;
  }

  async release(lock: RedisLock): Promise<boolean> {
    const { key, value } = lock;

    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(luaScript, 1, key, value);
    return result === 1;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
