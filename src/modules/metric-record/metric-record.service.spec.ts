import { Test, TestingModule } from '@nestjs/testing';
import { MetricRecordService } from './metric-record.service';
import { MetricRecordRepository } from './metric-record.repository';
import { UnitService } from '../unit/unit.service';
import { UnitConverterService } from '../unit/unit-converter/unit-converter.service';
import { METRICAL_SERVICE } from '../../rabbitmq/rabbitmq.module';
import { MetricRecord, MetricType } from './metric-record.entity';
import { CreateMetricRecordDto } from './dtos/add-metric-record.dto';
import { DistanceUnit, TemperatureUnit } from '../unit/dtos/unit.dto';
import { GetMetricRecordsDto } from './dtos/get-metric-record.dto';
import { GetMetricRecordsChartDto, TimeInterval } from './dtos/metric-record-chart.dto';
import { of, throwError } from 'rxjs';
import { METRICAL_RECORD_CREATE_MESSAGE } from '../../rabbitmq/message.constant';
import { chain } from 'stream-chain';
import * as sleepModule from '../../utilities/sleep';

jest.mock('stream-chain');
jest.mock('stream-json');
jest.mock('stream-json/streamers/StreamArray');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(() => 'mockReadStream'),
}));
jest.mock('../../utilities/sleep');


describe('MetricRecordService', () => {
  let service: MetricRecordService;

  const mockMetricRecordRepository = {
    createMetricRecord: jest.fn(),
    getMetricRecords: jest.fn(),
    getMetricRecordsChart: jest.fn(),
  };

  const mockUnitService = {
    list: jest.fn(),
  };

  const mockUnitConverterService = {
    convertDistance: jest.fn(),
    convertTemperature: jest.fn(),
  };

  const mockClientRMQ = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricRecordService,
        {
          provide: MetricRecordRepository,
          useValue: mockMetricRecordRepository,
        },
        {
          provide: UnitService,
          useValue: mockUnitService,
        },
        {
          provide: UnitConverterService,
          useValue: mockUnitConverterService,
        },
        {
          provide: METRICAL_SERVICE,
          useValue: mockClientRMQ,
        },
      ],
    }).compile();

    service = module.get<MetricRecordService>(MetricRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  xdescribe('createMetricRecordMQ', () => {
    const validPayload: CreateMetricRecordDto = {
      data: [{ value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' }],
    };

    it('should create metric records successfully with valid distance data', async () => {
      mockUnitService.list.mockReturnValue([ { name: 'Meter', symbol: 'm', metricType: MetricType.DISTANCE }]);

      mockUnitConverterService.convertDistance.mockReturnValue(100);

      mockMetricRecordRepository.createMetricRecord.mockResolvedValue([
        {
          id: 'uuid-1',
          value: 100,
          metricType: MetricType.DISTANCE,
          source: validPayload.data[0],
          recordedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);

      const result = await service.createMetricRecordMQ(validPayload);

      expect(result).toBe(true);
      expect(mockUnitService.list).toHaveBeenCalled();
      expect(mockUnitConverterService.convertDistance).toHaveBeenCalledWith(
        100,
        DistanceUnit.METER,
        DistanceUnit.METER,
      );
      expect(mockMetricRecordRepository.createMetricRecord).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            value: 100,
            metricType: MetricType.DISTANCE,
            source: validPayload.data[0],
          }),
        ]),
      );
    });

    it('should throw error when repository fails', async () => {
      mockUnitService.list.mockReturnValue([ { name: 'Meter', symbol: 'm', metricType: MetricType.DISTANCE }]);
      mockUnitConverterService.convertDistance.mockReturnValue(100);
      const dbError = new Error('Database connection failed');
      mockMetricRecordRepository.createMetricRecord.mockRejectedValue(dbError);

      await expect(service.createMetricRecordMQ(validPayload)).rejects.toThrow('Database connection failed');
      expect(mockUnitService.list).toHaveBeenCalled();
      expect(mockMetricRecordRepository.createMetricRecord).toHaveBeenCalled();
    });
  });

  xdescribe('createMetricRecord', () => {
    const validPayload: CreateMetricRecordDto = {
      data: [{ value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' }],
    };

    it('should emit data to RabbitMQ and return true', async () => {
      mockClientRMQ.emit.mockReturnValue(of(undefined));

      const result = await service.createMetricRecord(validPayload);

      expect(result).toBe(true);
      expect(mockClientRMQ.emit).toHaveBeenCalled();
    });

    it('should handle emit errors gracefully', async () => {
      const errorObservable = {
        subscribe: jest.fn(({ error }) => {
          error(new Error('RabbitMQ connection failed'));
        }),
      };
      mockClientRMQ.emit.mockReturnValue(errorObservable);

      const result = await service.createMetricRecord(validPayload);

      expect(result).toBe(true);
      expect(mockClientRMQ.emit).toHaveBeenCalled();
    });
  });

  xdescribe('getMetricRecords', () => {
    const validParams: GetMetricRecordsDto = {
      metricType: MetricType.DISTANCE,
      take: 10,
      direction: 'next',
    };

    it('should return paginated records successfully', async () => {
      const mockRecords: MetricRecord[] = [
        {
          id: 'uuid-1',
          value: 100,
          metricType: MetricType.DISTANCE,
          source: { value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' },
          recordedAt: new Date('2024-01-01T00:00:00Z'),
          createdAt: new Date(),
        },
        {
          id: 'uuid-2',
          value: 200,
          metricType: MetricType.DISTANCE,
          source: { value: 200, unit: 'm', date: '2024-01-02T00:00:00Z' },
          recordedAt: new Date('2024-01-02T00:00:00Z'),
          createdAt: new Date(),
        },
      ];
      mockMetricRecordRepository.getMetricRecords.mockResolvedValue([mockRecords, 2]);

      const result = await service.getMetricRecords(validParams);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].id).toBe('uuid-1');
      expect(result.data[0].value).toBe(100);
      expect(result.data[0].unit).toBe('m');
      expect(mockMetricRecordRepository.getMetricRecords).toHaveBeenCalledWith(validParams);
    });

    it('should return empty response when no records found', async () => {
      mockMetricRecordRepository.getMetricRecords.mockResolvedValue([[], 0]);

      const result = await service.getMetricRecords(validParams);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  xdescribe('getMetricRecordsChart', () => {
    const validParams: GetMetricRecordsChartDto = Object.assign(new GetMetricRecordsChartDto(), {
      metricType: MetricType.DISTANCE,
      unit: 'm',
      time: TimeInterval.ONE_MONTH,
    });

    it('should return chart data with original unit when no conversion needed', async () => {
      const mockRecords: MetricRecord[] = [
        {
          id: 'uuid-1',
          value: 100,
          metricType: MetricType.DISTANCE,
          source: { value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' },
          recordedAt: new Date('2024-01-01T00:00:00Z'),
          createdAt: new Date(),
        },
      ];
      mockMetricRecordRepository.getMetricRecordsChart.mockResolvedValue(mockRecords);
      mockUnitConverterService.convertDistance.mockReturnValue(100);

      const result = await service.getMetricRecordsChart(validParams);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(100);
      expect(result[0].unit).toBe('m');
    });

    it('should return chart data with converted unit for distance', async () => {
      const paramsWithConversion = Object.assign(new GetMetricRecordsChartDto(), {
        metricType: MetricType.DISTANCE,
        unit: 'ft',
        time: TimeInterval.ONE_MONTH,
      });
      const mockRecords: MetricRecord[] = [
        {
          id: 'uuid-1',
          value: 100,
          metricType: MetricType.DISTANCE,
          source: { value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' },
          recordedAt: new Date('2024-01-01T00:00:00Z'),
          createdAt: new Date(),
        },
      ];
      mockMetricRecordRepository.getMetricRecordsChart.mockResolvedValue(mockRecords);
      mockUnitConverterService.convertDistance.mockReturnValue(328.084);

      const result = await service.getMetricRecordsChart(paramsWithConversion);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(328.084);
      expect(result[0].unit).toBe('ft');
      expect(mockUnitConverterService.convertDistance).toHaveBeenCalledWith(
        100,
        DistanceUnit.METER,
        'ft',
      );
    });

    it('should return chart data with converted unit for temperature', async () => {
      const tempParams = Object.assign(new GetMetricRecordsChartDto(), {
        metricType: MetricType.TEMPERATURE,
        unit: '°F',
        time: TimeInterval.ONE_MONTH,
      });
      const mockRecords: MetricRecord[] = [
        {
          id: 'uuid-1',
          value: 25,
          metricType: MetricType.TEMPERATURE,
          source: { value: 25, unit: '°C', date: '2024-01-01T00:00:00Z' },
          recordedAt: new Date('2024-01-01T00:00:00Z'),
          createdAt: new Date(),
        },
      ];
      mockMetricRecordRepository.getMetricRecordsChart.mockResolvedValue(mockRecords);
      mockUnitConverterService.convertTemperature.mockReturnValue(77);

      const result = await service.getMetricRecordsChart(tempParams);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(77);
      expect(result[0].unit).toBe('°F');
      expect(mockUnitConverterService.convertTemperature).toHaveBeenCalledWith(
        25,
        TemperatureUnit.CELSIUS,
        '°F',
      );
    });

    it('should return empty array when no records found', async () => {
      mockMetricRecordRepository.getMetricRecordsChart.mockResolvedValue([]);

      const result = await service.getMetricRecordsChart(validParams);

      expect(result).toEqual([]);
    });
  });

  describe('handleImportFile', ()=> {
    it('should process the import file successfully', async () => {
      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.next('completed');
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.handleImportFile('/path/to/file.csv');

      expect(mockClientRMQ.emit).toHaveBeenCalled();
      expect(mockObservable.subscribe).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('File imported successfully:', 'completed');
    });

    it('should handle emit errors gracefully', async () => {
      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.error(new Error('RabbitMQ connection failed'));
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      await service.handleImportFile('/path/to/file.csv');

      expect(mockClientRMQ.emit).toHaveBeenCalled();
      expect(mockObservable.subscribe).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Error importing file', new Error('RabbitMQ connection failed'));
    })

    it('should handle emit complete gracefully', async () => {
      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.complete();
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      await service.handleImportFile('/path/to/file.csv');

      expect(mockClientRMQ.emit).toHaveBeenCalled();
      expect(mockObservable.subscribe).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('File imported successfully');
    })
  });

  describe('importFromFile', () => {
    const mockedChain = chain as jest.MockedFunction<typeof chain>;
    const mockedSleep = sleepModule.sleep as jest.MockedFunction<typeof sleepModule.sleep>;

    function createMockPipeline(values: any[]) {
      return {
        [Symbol.asyncIterator]: async function* () {
          for (const value of values) {
            yield { value };
          }
        },
      };
    }

    beforeEach(() => {
      jest.clearAllMocks();
      mockedSleep.mockResolvedValue(undefined);
    });

    it('should process a small file with fewer items than batch size', async () => {
      const testData = [
        { value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' },
        { value: 200, unit: 'm', date: '2024-01-02T00:00:00Z' },
      ];

      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.next('success');
          handlers.complete();
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      mockedChain.mockReturnValue(createMockPipeline(testData) as any);

      const result = await service.importFromFile('/path/to/file.json');

      expect(result).toEqual({ status: 'DONE' });
      expect(mockClientRMQ.emit).toHaveBeenCalledTimes(1);
      expect(mockClientRMQ.emit).toHaveBeenCalledWith(METRICAL_RECORD_CREATE_MESSAGE, {
        data: testData,
      });
      expect(mockedSleep).toHaveBeenCalledWith(1000);
    });

    it('should process file with exactly batch size items', async () => {
      const batchSize = 3000;
      const testData = Array.from({ length: batchSize }, (_, i) => ({
        value: i,
        unit: 'm',
        date: '2024-01-01T00:00:00Z',
      }));

      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.next('success');
          handlers.complete();
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      mockedChain.mockReturnValue(createMockPipeline(testData) as any);

      const result = await service.importFromFile('/path/to/file.json');

      expect(result).toEqual({ status: 'DONE' });
      expect(mockClientRMQ.emit).toHaveBeenCalledTimes(1);
      expect(mockedSleep).toHaveBeenCalledTimes(1);
    });

    xit('should process file with multiple batches and remainder', async () => {
      const totalItems = 7500;
      const testData = Array.from({ length: totalItems }, (_, i) => ({
        value: i,
        unit: 'm',
        date: '2024-01-01T00:00:00Z',
      }));

      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.next('success');
          handlers.complete();
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      mockedChain.mockReturnValue(createMockPipeline(testData) as any);
      const result = await service.importFromFile('/path/to/file.json');
      console.log(result);
      expect(result).toEqual({ status: 'DONE' });
      expect(mockClientRMQ.emit).toHaveBeenCalledTimes(3);
      expect(mockedSleep).toHaveBeenCalledTimes(3);
      expect(mockedSleep).toHaveBeenCalledWith(1000);
    });

    xit('should handle emit errors gracefully and continue processing', async () => {
      const testData = [
        { value: 100, unit: 'm', date: '2024-01-01T00:00:00Z' },
      ];

      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.error(new Error('RabbitMQ connection failed'));
        }),
      };
      mockClientRMQ.emit.mockReturnValue(mockObservable);
      mockedChain.mockReturnValue(createMockPipeline(testData) as any);

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.importFromFile('/path/to/file.json');

      expect(result).toEqual({ status: 'DONE' });
      expect(mockClientRMQ.emit).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
