import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { LoggerService } from '../logger/logger.service';
import { TypeOrmCustomLogger } from '../logger/typeorm.logger';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get<string>('database.type', { infer: true }),
      host: this.configService.get<string>('database.host', { infer: true }),
      port: this.configService.get<number>('database.port', { infer: true }),
      username: this.configService.get<string>('database.username', {
        infer: true,
      }),
      password: this.configService.get<string>('database.password', {
        infer: true,
      }),
      database: this.configService.get<string>('database.name', {
        infer: true,
      }),
      synchronize: false,
      dropSchema: false,
      keepConnectionAlive: true,
      logging: true,
      logger: new TypeOrmCustomLogger(this.loggerService),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    } as TypeOrmModuleOptions;
  }
}
