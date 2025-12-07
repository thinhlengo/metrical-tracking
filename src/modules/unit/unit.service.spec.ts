import { Test, TestingModule } from '@nestjs/testing';
import { UnitService } from './unit.service';
import { UnitRepository } from './unit.repository';
import { UnitDto, DistanceUnit } from './dtos/unit.dto';
import { MetricType } from '../metric-record/metric-record.entity';

describe('UnitService', () => {
  let service: UnitService;
  let unitRepository: jest.Mocked<UnitRepository>;

  beforeEach(async () => {
    const mockUnitRepository = {
      list: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        {
          provide: UnitRepository,
          useValue: mockUnitRepository,
        },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
    unitRepository = module.get(UnitRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return list of units from repository', () => {
      const mockUnits: UnitDto[] = [
        { name: DistanceUnit.METER, symbol: 'm', metricType: MetricType.DISTANCE },
        { name: DistanceUnit.CENTIMETER, symbol: 'cm', metricType: MetricType.DISTANCE },
      ];
      unitRepository.list.mockReturnValue(mockUnits);

      const result = service.list();

      expect(result).toEqual(mockUnits);
      expect(unitRepository.list).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository throws', () => {
      unitRepository.list.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      expect(() => service.list()).toThrow('Database connection failed');
    });
  });
});
