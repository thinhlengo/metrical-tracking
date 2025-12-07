import { Body, Controller, Get, Logger, Post, Query, UseGuards } from '@nestjs/common';
import { CreateMetricRecordDto } from './dtos/add-metric-record.dto';
import { MetricRecordService } from './metric-record.service';
import { SingleDataResponseDto } from '../../common/dtos/single-data-response.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { METRICAL_RECORD_CREATE_MESSAGE } from '../../rabbitmq/message.constant';
import { Channel, Message } from 'amqplib';
import { GetMetricRecordsDto } from './dtos/get-metric-record.dto';
import { PaginationResponseDtoWithCursor } from '../../common/dtos/pagination-response.dto';
import { RecordChartDto, RecordDto } from './dtos/record.dto';
import { GetMetricRecordsChartDto } from './dtos/metric-record-chart.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CheckMessageRetryGuard } from '../../guards/check-message-retry/check-message-retry.guard';

@Controller('metric-records')
export class MetricRecordController {
  private readonly logger = new Logger(MetricRecordController.name);

  constructor(private readonly metricRecordService: MetricRecordService) {}

  @ApiCreatedResponse({ description: 'Metric records created successfully', type: SingleDataResponseDto<boolean> })
  @Post()
  async createMetricRecord(@Body() createMetricRecordDto: CreateMetricRecordDto): Promise<SingleDataResponseDto<boolean>> {
    return new SingleDataResponseDto<boolean>(await this.metricRecordService.createMetricRecord(createMetricRecordDto));
  }

  @ApiOkResponse({ description: 'Metric records fetched successfully', type: PaginationResponseDtoWithCursor<RecordDto> })
  @Get()
  getMetricRecords(@Query() params: GetMetricRecordsDto): Promise<PaginationResponseDtoWithCursor<RecordDto>> {
    return this.metricRecordService.getMetricRecords(params);
  }

  @ApiOkResponse({ description: 'Metric records chart fetched successfully', type: SingleDataResponseDto<RecordChartDto[]> })
  @Get('chart')
  async getMetricRecordsChart(@Query() params: GetMetricRecordsChartDto) : Promise<SingleDataResponseDto<RecordChartDto[]>> {
    return new SingleDataResponseDto<RecordChartDto[]>(await this.metricRecordService.getMetricRecordsChart(params));
  }

  @UseGuards(CheckMessageRetryGuard)
  @EventPattern(METRICAL_RECORD_CREATE_MESSAGE)
  async createMetricRecordM(@Payload() payload: CreateMetricRecordDto, @Ctx() context: RmqContext) {
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
