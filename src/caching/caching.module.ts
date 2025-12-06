import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class CachingModule {}
