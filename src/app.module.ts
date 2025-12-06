import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { DatabaseModule } from './database/database.module';
import appConfig from './configurate/app.config';
import rabbitmqConfig from './configurate/rabbitmq.config';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './configurate/database.config';
import { CachingModule } from './caching/caching.module';
import { RedisModule } from './caching/redis.module';
import redisConfig from './configurate/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, rabbitmqConfig, databaseConfig, redisConfig],
      envFilePath: ['.env']
    }),
    LoggerModule,
    RabbitMQModule,
    DatabaseModule,
    CachingModule,
    RedisModule
  ],
})
export class AppModule {}
