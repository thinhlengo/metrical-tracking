import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configurate/config.type';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'METRICAL_SERVICE',
        useFactory: (configService: ConfigService<AllConfigType>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('rabbitmq.username', { infer: true })}:${configService.get('rabbitmq.password', { infer: true })}@${configService.get('rabbitmq.host', { infer: true })}:${configService.get('rabbitmq.port', { infer: true })}`,
            ],
            queue: 'metrical_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
