import { Test, TestingModule } from '@nestjs/testing';
import { MetricRecordController } from './metric-record.controller';
import { MetricRecordService } from './metric-record.service';
import { CreateMetricRecordDto } from './dtos/add-metric-record.dto';
import { GetMetricRecordsDto } from './dtos/get-metric-record.dto';
import { GetMetricRecordsChartDto, TimeInterval } from './dtos/metric-record-chart.dto';
import { MetricType } from './metric-record.entity';
import { SingleDataResponseDto } from '../../common/dtos/single-data-response.dto';
import { PaginationResponseDtoWithCursor } from '../../common/dtos/pagination-response.dto';
import { RecordChartDto, RecordDto } from './dtos/record.dto';
import { RmqContext } from '@nestjs/microservices';

describe('MetricRecordController', () => {
  let controller: MetricRecordController;
  let metricRecordService: jest.Mocked<MetricRecordService>;

  const mockMetricRecordService = {
    createMetricRecord: jest.fn(),
    getMetricRecords: jest.fn(),
    getMetricRecordsChart: jest.fn(),
    createMetricRecordMQ: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricRecordController],
      providers: [
        {
          provide: MetricRecordService,
          useValue: mockMetricRecordService,
        },
      ],
    }).compile();

    controller = module.get<MetricRecordController>(MetricRecordController);
    metricRecordService = module.get(MetricRecordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMetricRecord', () => {
    const validDto: CreateMetricRecordDto = {
      data: [{ value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' }],
    };

    it('should return SingleDataResponseDto<true> when service succeeds', async () => {
      mockMetricRecordService.createMetricRecord.mockResolvedValue(true);
      const result = await controller.createMetricRecord(validDto);
      expect(result).toBeInstanceOf(SingleDataResponseDto);
      expect(result.data).toBe(true);
      expect(mockMetricRecordService.createMetricRecord).toHaveBeenCalledWith(validDto);
    });

    it('should return SingleDataResponseDto<false> when service returns false', async () => {
      mockMetricRecordService.createMetricRecord.mockResolvedValue(false);
      const result = await controller.createMetricRecord(validDto);
      expect(result).toBeInstanceOf(SingleDataResponseDto);
      expect(result.data).toBe(false);
    });

    it('should throw error when service throws exception', async () => {
      const error = new Error('Database connection failed');
      mockMetricRecordService.createMetricRecord.mockRejectedValue(error);
      await expect(controller.createMetricRecord(validDto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getMetricRecords (GET /metric-records)', () => {
    const validParams: GetMetricRecordsDto = {
      metricType: MetricType.DISTANCE,
      take: 10,
      direction: 'next',
    };

    it('should return paginated records when service succeeds', async () => {
      const mockRecords: RecordDto[] = [
        { id: '1', value: 100, metricType: MetricType.DISTANCE, unit: 'm', date: new Date() },
        { id: '2', value: 200, metricType: MetricType.DISTANCE, unit: 'm', date: new Date() },
      ];
      const mockResponse = new PaginationResponseDtoWithCursor(mockRecords, 2, undefined, 'next', 10, '2', '1');
      mockMetricRecordService.getMetricRecords.mockResolvedValue(mockResponse);

      const result = await controller.getMetricRecords(validParams);

      expect(result).toBe(mockResponse);
      expect(result.data).toHaveLength(2);
      expect(mockMetricRecordService.getMetricRecords).toHaveBeenCalledWith(validParams);
    });

    it('should return empty array when no records match', async () => {
      const emptyResponse = new PaginationResponseDtoWithCursor<RecordDto>([], 0, undefined, 'next', 10);
      mockMetricRecordService.getMetricRecords.mockResolvedValue(emptyResponse);

      const result = await controller.getMetricRecords(validParams);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should throw error when service throws exception', async () => {
      const error = new Error('Query execution failed');
      mockMetricRecordService.getMetricRecords.mockRejectedValue(error);

      await expect(controller.getMetricRecords(validParams)).rejects.toThrow('Query execution failed');
    });
  });

  describe('getMetricRecordsChart (GET /metric-records/chart)', () => {
    const validParams: GetMetricRecordsChartDto = Object.assign(new GetMetricRecordsChartDto(), {
      metricType: MetricType.DISTANCE,
      unit: 'm',
      time: TimeInterval.ONE_MONTH,
    });

    it('should return chart data when service succeeds', async () => {
      const mockChartData: RecordChartDto[] = [
        { date: new Date(), value: 100, unit: 'm' },
        { date: new Date(), value: 150, unit: 'm' },
      ];
      mockMetricRecordService.getMetricRecordsChart.mockResolvedValue(mockChartData);

      const result = await controller.getMetricRecordsChart(validParams);

      expect(result).toBeInstanceOf(SingleDataResponseDto);
      expect(result.data).toEqual(mockChartData);
      expect(mockMetricRecordService.getMetricRecordsChart).toHaveBeenCalledWith(validParams);
    });

    it('should return empty array when no chart data exists', async () => {
      mockMetricRecordService.getMetricRecordsChart.mockResolvedValue([]);

      const result = await controller.getMetricRecordsChart(validParams);

      expect(result).toBeInstanceOf(SingleDataResponseDto);
      expect(result.data).toEqual([]);
    });

    it('should throw error when service throws exception', async () => {
      const error = new Error('Chart aggregation failed');
      mockMetricRecordService.getMetricRecordsChart.mockRejectedValue(error);

      await expect(controller.getMetricRecordsChart(validParams)).rejects.toThrow('Chart aggregation failed');
    });
  });

  describe('createMetricRecordM (RabbitMQ EventPattern)', () => {
    const validPayload: CreateMetricRecordDto = {
      data: [
        { value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' },
      ],
    };

    const createMockRmqContext = (): { context: RmqContext; mockChannel: { ack: jest.Mock; nack: jest.Mock }; mockMessage: object } => {
      const mockMessage = { content: Buffer.from(JSON.stringify(validPayload)) };
      const mockChannel = { ack: jest.fn(), nack: jest.fn() };

      const context = {
        getChannelRef: () => mockChannel,
        getMessage: () => mockMessage,
      } as unknown as RmqContext;

      return { context, mockChannel, mockMessage };
    };

    it('should ack message when service succeeds', async () => {
      const { context, mockChannel, mockMessage } = createMockRmqContext();
      mockMetricRecordService.createMetricRecordMQ.mockResolvedValue(undefined);

      await controller.createMetricRecordM(validPayload, context);

      expect(mockMetricRecordService.createMetricRecordMQ).toHaveBeenCalledWith(validPayload);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('should nack message with requeue when service fails', async () => {
      const { context, mockChannel, mockMessage } = createMockRmqContext();
      const error = new Error('Processing failed');
      mockMetricRecordService.createMetricRecordMQ.mockRejectedValue(error);

      await expect(controller.createMetricRecordM(validPayload, context)).rejects.toThrow('Processing failed');

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, true);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should throw error and nack when service throws exception', async () => {
      const { context, mockChannel, mockMessage } = createMockRmqContext();
      const error = new Error('Database write failed');
      mockMetricRecordService.createMetricRecordMQ.mockRejectedValue(error);

      await expect(controller.createMetricRecordM(validPayload, context)).rejects.toThrow('Database write failed');

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, true);
    });
  });
});
