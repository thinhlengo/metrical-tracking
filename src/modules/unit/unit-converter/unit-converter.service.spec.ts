import { Test, TestingModule } from '@nestjs/testing';
import { UnitConverterService } from './unit-converter.service';

describe('UnitConverterService', () => {
  let service: UnitConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitConverterService],
    }).compile();

    service = module.get<UnitConverterService>(UnitConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
