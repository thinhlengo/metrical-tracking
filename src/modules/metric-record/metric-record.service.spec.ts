import { Test, TestingModule } from '@nestjs/testing';
import { MetricRecordService } from './metric-record.service';

describe('MetricRecordService', () => {
  let service: MetricRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricRecordService],
    }).compile();

    service = module.get<MetricRecordService>(MetricRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
