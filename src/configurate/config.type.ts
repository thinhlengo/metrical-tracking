import { AppConfig } from './app-config.type';
import { DatabaseConfig } from './database.config';
import { RabbitMQConfig } from './rabbitmq.config';
import { ThrottleConfig } from './throttle-config';
import { RedisConfig } from './redis.config';

export type AllConfigType = {
  app: AppConfig;
  rabbitmq: RabbitMQConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
};
