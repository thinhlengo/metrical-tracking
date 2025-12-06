import { Test, TestingModule } from '@nestjs/testing';
import { MetricRecordController } from './metric-record.controller';

describe('MetricRecordController', () => {
  let controller: MetricRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricRecordController],
    }).compile();

    controller = module.get<MetricRecordController>(MetricRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
