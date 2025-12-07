import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { Unit } from './unit.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisService } from '../../caching/redis/redis.service';
import { sleep } from '../../utilities/sleep';

@Injectable()
export class UnitService {

  constructor(private readonly unitRepository: UnitRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly redisService: RedisService,
  ) {}

  async list(): Promise<Unit[]> {
    const cacheKey = 'units';
    const lockKey = `lock:${cacheKey}`;

    const cachedUnits = await this.cache.get<Unit[]>(cacheKey);
    if (cachedUnits) {
      return cachedUnits;
    }

    const lock = await this.redisService.acquire(lockKey, {
      ttlMs: 5000,        
      retryDelayMs: 300,
      maxRetries: 10,
    });

    if (!lock) {
      const maxWaitMs = 5000;
      const stepMs = 100;
      const start = Date.now();

      while (Date.now() - start < maxWaitMs) {
        const updated = await this.cache.get<Unit[]>(cacheKey);
        if (updated) return updated;

        await sleep(stepMs);
      }
    }

    try {
      const units = await this.unitRepository.list();
      await this.cache.set(cacheKey, units);
      return units;
    } finally {
      await this.redisService.release(lock!);
    }
  }
}
