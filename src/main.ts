import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger/logger.service';
import { AllConfigType } from './configurate/config.type';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { useContainer } from 'class-validator';
import { json } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { RequestLoggingInterceptor } from './interceptors/request-logging.interceptor';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });
  
  const logger = app.get(LoggerService);
  const configService = app.get(ConfigService<AllConfigType>);

  const metricalService = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get('rabbitmq.username', { infer: true })}:${configService.get('rabbitmq.password', { infer: true })}@${configService.get('rabbitmq.host', { infer: true })}:${configService.get('rabbitmq.port', { infer: true })}`,
      ],
      queue: 'metrical_queue',
      queueOptions: {
        durable: true,
      },
      noAck: true,
      persistent: true,
      prefetchCount: 1,
    },
  });

  app.use(cookieParser());
  app.use(helmet());
  app.use(json({ limit: '50mb' }));

  app.useGlobalInterceptors(new RequestLoggingInterceptor(logger));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.enableCors({
    origin: configService.get('app.allowedOrigins', {
      infer: true,
    }) as string[],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error.stack);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection:', reason);
  });

  await app.startAllMicroservices();

  await app.listen(configService.get('app.port', { infer: true }) as number);
}
bootstrap();
