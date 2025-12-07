import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configurate/config.type';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';
import { METRICAL_QUEUE } from './message.constant';

export const METRICAL_SERVICE = 'METRICAL_SERVICE';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: METRICAL_SERVICE,
        useFactory: (configService: ConfigService<AllConfigType>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('rabbitmq.username', { infer: true })}:${configService.get('rabbitmq.password', { infer: true })}@${configService.get('rabbitmq.host', { infer: true })}:${configService.get('rabbitmq.port', { infer: true })}`,
            ],
            queue: METRICAL_QUEUE,
            queueOptions: {
              durable: true,
              arguments: {
                'x-queue-type': 'quorum' 
              }
            },
            persistent: true,
            prefetchCount: 1,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
