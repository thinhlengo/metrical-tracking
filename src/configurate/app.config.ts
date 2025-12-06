import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AppConfig } from './app-config.type';
import validateConfig from './validate-config';

class EnvironmentVariablesValidator {
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  APP_ALLOWED_ORIGINS: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
    allowedOrigins: process.env.APP_ALLOWED_ORIGINS
      ? process.env.APP_ALLOWED_ORIGINS.split(',')
      : [],
  };
});
