import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { MetricRecordController } from '../src/modules/metric-record/metric-record.controller';
import { MetricRecordService } from '../src/modules/metric-record/metric-record.service';
import { MetricType } from '../src/modules/metric-record/metric-record.entity';
import { PaginationResponseDtoWithCursorDto } from '../src/common/dtos/pagination-response.dto';
import { RecordDto } from '../src/modules/metric-record/dtos/record.dto';
import { METRICAL_API_VERSION_1 } from '../src/common/constant';

describe('MetricRecordController (e2e)', () => {
  let app: INestApplication<App>;

  const mockMetricRecordService = {
    createMetricRecord: jest.fn(),
    getMetricRecords: jest.fn(),
    getMetricRecordsChart: jest.fn(),
    createMetricRecordMQ: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MetricRecordController],
      providers: [
        {
          provide: MetricRecordService,
          useValue: mockMetricRecordService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: METRICAL_API_VERSION_1,
      prefix: 'v',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /v1/metric-records', () => {
    it('should return 200 and paginated records when valid request', async () => {
      const mockRecords: RecordDto[] = [
        { id: '1', value: 100, metricType: MetricType.DISTANCE, unit: 'm', date: new Date('2024-01-01') },
        { id: '2', value: 200, metricType: MetricType.DISTANCE, unit: 'm', date: new Date('2024-01-02') },
      ];
      const mockResponse = new PaginationResponseDtoWithCursorDto(mockRecords, 2, undefined, 'next', 10, '2', '1');
      mockMetricRecordService.getMetricRecords.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/v1/metric-records')
        .query({ metricType: MetricType.DISTANCE, take: 10 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(mockMetricRecordService.getMetricRecords).toHaveBeenCalled();
    });

    it('should return 400 when take exceeds maximum limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/metric-records')
        .query({ metricType: MetricType.DISTANCE, take: 9999 })
        .expect(400);

      expect(response.body.message).toContain('take must not be greater than 1000');
      expect(mockMetricRecordService.getMetricRecords).not.toHaveBeenCalled();
    });
  });
});
