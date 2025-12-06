import { IsInt, IsOptional, IsString } from "class-validator";
import { Min } from "class-validator";
import { Max } from "class-validator";
import { registerAs } from "@nestjs/config";
import validateConfig from "./validate-config";

export type RedisConfig = {
  host: string;
  port: number;
  password: string;
};

class EnvironmentVariablesValidator {
  @IsString()
  REDIS_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string;
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD ?? '',
  };
});