import { AppConfig } from './app-config.type';
import { DatabaseConfig } from './database.config';
import { RabbitMQConfig } from './rabbitmq.config';
import { RedisConfig } from './redis.config';

export type AllConfigType = {
  app: AppConfig;
  rabbitmq: RabbitMQConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
};
