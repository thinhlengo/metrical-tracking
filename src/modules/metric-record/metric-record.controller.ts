import { BadRequestException, Body, Controller, Get, Inject, Logger, Post, Query, UploadedFile, UseGuards, UseInterceptors, Version } from '@nestjs/common';
import { CreateMetricRecordDto } from './dtos/add-metric-record.dto';
import { MetricRecordService } from './metric-record.service';
import { SingleDataResponseDto } from '../../common/dtos/single-data-response.dto';
import { ClientRMQ, Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { METRICAL_RECORD_CREATE_MESSAGE, METRICAL_RECORD_IMPORT_FILE_MESSAGE } from '../../rabbitmq/message.constant';
import { Channel, Message } from 'amqplib';
import { GetMetricRecordsDto } from './dtos/get-metric-record.dto';
import { PaginationResponseDtoWithCursorDto } from '../../common/dtos/pagination-response.dto';
import { RecordChartDto, RecordDto } from './dtos/record.dto';
import { GetMetricRecordsChartDto } from './dtos/metric-record-chart.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CheckMessageRetryGuard } from '../../guards/check-message-retry/check-message-retry.guard';
import { METRICAL_API_VERSION_1 } from '../../common/constant';
import { ValidationAddRecordService } from './validation/validation-add-record';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { METRICAL_SERVICE } from 'src/rabbitmq/rabbitmq.module';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
};

@Controller('metric-records')
export class MetricRecordController {
  private readonly logger = new Logger(MetricRecordController.name);

  constructor(private readonly metricRecordService: MetricRecordService,
    private readonly validationAddRecordService: ValidationAddRecordService) {
  }

  @Version(METRICAL_API_VERSION_1)
  @ApiCreatedResponse({ description: 'Metric records created successfully', type: SingleDataResponseDto<boolean> })
  @Post()
  async createMetricRecord(@Body() createMetricRecordDto: CreateMetricRecordDto): Promise<SingleDataResponseDto<boolean>> {
    const errors = this.validationAddRecordService.validateRecords(createMetricRecordDto.data);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errors,
        totalErrors: errors.length,
      });
    }
    return new SingleDataResponseDto<boolean>(await this.metricRecordService.createMetricRecord(createMetricRecordDto));
  }

  @Version(METRICAL_API_VERSION_1)
  @ApiOkResponse({ description: 'Metric records fetched successfully', type: PaginationResponseDtoWithCursorDto<RecordDto> })
  @Get()
  getMetricRecords(@Query() params: GetMetricRecordsDto): Promise<PaginationResponseDtoWithCursorDto<RecordDto>> {
    return this.metricRecordService.getMetricRecords(params);
  }

  @Version(METRICAL_API_VERSION_1)
  @ApiOkResponse({ description: 'Metric records chart fetched successfully', type: SingleDataResponseDto<RecordChartDto[]> })
  @Get('chart')
  async getMetricRecordsChart(@Query() params: GetMetricRecordsChartDto): Promise<SingleDataResponseDto<RecordChartDto[]>> {
    return new SingleDataResponseDto<RecordChartDto[]>(await this.metricRecordService.getMetricRecordsChart(params));
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async import(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    await this.metricRecordService.handleImportFile(file.path);

    return { message: 'File processing started' };
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

  @UseGuards(CheckMessageRetryGuard)
  @EventPattern(METRICAL_RECORD_IMPORT_FILE_MESSAGE)
  async createMetricRecordFromFile(@Payload() payload: { data: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.metricRecordService.importFromFile(payload.data);
      this.logger.log(`Metric records imported`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error importing metric records`, error);
      channel.nack(originalMsg, false, true);
      throw error;
    }
  }
}

