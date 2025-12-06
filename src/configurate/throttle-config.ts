import { IsInt, Min } from 'class-validator';
import validateConfig from './validate-config';
import { registerAs } from '@nestjs/config';

export type ThrottleConfig = {
  ttl: number;
  limit: number;
};

class EnvironmentVariablesValidator {
  @IsInt()
  @Min(0)
  THROTTLE_TTL: number;

  @IsInt()
  @Min(0)
  THROTTLE_LIMIT: number;
}

export default registerAs<ThrottleConfig>('throttle', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    ttl: process.env.THROTTLE_TTL
      ? parseInt(process.env.THROTTLE_TTL, 10)
      : 60000,
    limit: process.env.THROTTLE_LIMIT
      ? parseInt(process.env.THROTTLE_LIMIT, 10)
      : 10,
  };
});
