import { IsInt, IsOptional, IsString } from 'class-validator';
import { Min } from 'class-validator';
import { Max } from 'class-validator';
import { registerAs } from '@nestjs/config';
import validateConfig from './validate-config';

export type RabbitMQConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
};

class EnvironmentVariablesValidator {
  @IsString()
  RABBITMQ_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  RABBITMQ_PORT: number;

  @IsString()
  @IsOptional()
  RABBITMQ_USERNAME: string;

  @IsString()
  @IsOptional()
  RABBITMQ_PASSWORD: string;
}

export default registerAs<RabbitMQConfig>('rabbitmq', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.RABBITMQ_HOST ?? 'localhost',
    port: process.env.RABBITMQ_PORT
      ? parseInt(process.env.RABBITMQ_PORT, 10)
      : 5672,
    username: process.env.RABBITMQ_USERNAME ?? 'guest',
    password: process.env.RABBITMQ_PASSWORD ?? ('guest' as string),
  };
});
