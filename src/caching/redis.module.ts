import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AllConfigType } from 'src/configurate/config.type';
import { RedisService } from './redis/redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService<AllConfigType>],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return new Redis({
          host: configService.get('redis.host', { infer: true }),
          port: configService.get('redis.port', { infer: true }),
          password: configService.get('redis.password', { infer: true }),
        });
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
