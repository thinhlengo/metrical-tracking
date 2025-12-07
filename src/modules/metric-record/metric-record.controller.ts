import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { CreateMetricRecordDto } from './dtos/add-metric-record.dto';
import { MetricRecordService } from './metric-record.service';
import { SingleDataResponseDto } from 'src/common/dtos/single-data-response.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { METRICAL_RECORD_CREATE_MESSAGE } from 'src/rabbitmq/message.constant';
import { Channel, Message } from 'amqplib';
import { GetMetricRecordsDto } from './dtos/get-metric-record.dto';
import { PaginationResponseDtoWithCursor } from 'src/common/dtos/pagination-response.dto';
import { RecordDto } from './dtos/record.dto';

@Controller('metric-records')
export class MetricRecordController {
  private readonly logger = new Logger(MetricRecordController.name);

  constructor(private readonly metricRecordService: MetricRecordService) {}

  @Post()
  async createMetricRecord(@Body() createMetricRecordDto: CreateMetricRecordDto): Promise<SingleDataResponseDto<boolean>> {
    return new SingleDataResponseDto<boolean>(await this.metricRecordService.createMetricRecord(createMetricRecordDto));
  }

  @Get()
  getMetricRecords(@Query() params: GetMetricRecordsDto): Promise<PaginationResponseDtoWithCursor<RecordDto>> {
    return this.metricRecordService.getMetricRecords(params);
  }

  @EventPattern(METRICAL_RECORD_CREATE_MESSAGE)
  async createMetricRecordM(@Payload() payload: CreateMetricRecordDto, @Ctx() context: RmqContext ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.metricRecordService.createMetricRecordMQ(payload);
      this.logger.log(`Metric records created`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error creating metric records`, error);
      channel.nack(originalMsg, false, true);
      throw error;
    }
  }
}
