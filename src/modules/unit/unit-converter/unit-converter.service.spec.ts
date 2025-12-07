import { Test, TestingModule } from '@nestjs/testing';
import { UnitConverterService } from './unit-converter.service';
import { DistanceUnit, TemperatureUnit } from '../dtos/unit.dto';

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

  describe('convertDistance', () => {
    it('should convert 100 centimeters to 1 meter', () => {
      const result = service.convertDistance(100, DistanceUnit.CENTIMETER, DistanceUnit.METER);
      expect(result).toBe(1);
    });

    it('should return NaN when converting with an invalid unit', () => {
      const result = service.convertDistance(100, 'invalid' as DistanceUnit, DistanceUnit.METER);
      expect(result).toBeNaN();
    });
  });

  describe('convertTemperature', () => {
    it('should convert 0 Celsius to 32 Fahrenheit', () => {
      const result = service.convertTemperature(0, TemperatureUnit.CELSIUS, TemperatureUnit.FAHRENHEIT);
      expect(result).toBe(32);
    });

    it('should throw error when converting from an unknown temperature unit', () => {
      expect(() => {
        service.convertTemperature(100, 'invalid' as TemperatureUnit, TemperatureUnit.CELSIUS);
      }).toThrow('Unknown temperature unit: invalid');
    });
  });
});
