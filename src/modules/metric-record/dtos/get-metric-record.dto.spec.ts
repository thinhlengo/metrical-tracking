import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetMetricRecordsDto } from './get-metric-record.dto';
import { MetricType } from '../metric-record.entity';

describe('GetMetricRecordsDto', () => {
  describe('valid DTO', () => {
    it('should pass validation with correct data', async () => {
      const validData = {
        metricType: MetricType.DISTANCE,
        cursor: 'abc123',
        direction: 'next',
        take: 50,
      };

      const dto = plainToInstance(GetMetricRecordsDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('invalid DTO', () => {
    it('should fail validation with incorrect data', async () => {
      const invalidData = {
        metricType: 'INVALID_TYPE',
        direction: 'invalid-direction',
        take: 2000, // exceeds max of 1000
      };

      const dto = plainToInstance(GetMetricRecordsDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      
      const errorProperties = errors.map((e) => e.property);
      expect(errorProperties).toContain('metricType');
      expect(errorProperties).toContain('direction');
      expect(errorProperties).toContain('take');
    });
  });
});
