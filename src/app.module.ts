import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { DatabaseModule } from './database/database.module';
import appConfig from './configurate/app.config';
import rabbitmqConfig from './configurate/rabbitmq.config';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './configurate/database.config';
import { MetricRecordModule } from './modules/metric-record/metric-record.module';
import { UnitModule } from './modules/unit/unit.module';
import redisConfig from './configurate/redis.config';
import { RateLimitMiddleware } from './middlewares/rate-limit/rate-limit.middleware';
import { ContextMiddleware } from './middlewares/context/context.middleware';
import { ContextService } from './middlewares/context/context.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, rabbitmqConfig, databaseConfig, redisConfig],
      envFilePath: ['.env']
    }),
    PrometheusModule.register({
      path: '/p-metrics',
    }),
    LoggerModule,
    RabbitMQModule,
    DatabaseModule,
    MetricRecordModule,
    UnitModule
  ],
  providers: [ContextService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
