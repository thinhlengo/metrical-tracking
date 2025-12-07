import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetMetricRecordsChartDto, TimeInterval } from './metric-record-chart.dto';
import { MetricType } from '../metric-record.entity';

describe('GetMetricRecordsChartDto', () => {
  describe('valid DTO', () => {
    it('should pass validation with correct data', async () => {
      const validData = {
        metricType: MetricType.DISTANCE,
        time: TimeInterval.ONE_MONTH,
      };

      const dto = plainToInstance(GetMetricRecordsChartDto, validData);
      const errors = await validate(dto, { skipMissingProperties: true });

      expect(errors.length).toBe(0);
    });
  });

  describe('invalid DTO', () => {
    it('should fail validation with incorrect data', async () => {
      const invalidData = {
        metricType: 'INVALID_TYPE',
        time: 'invalid-time',
      };

      const dto = plainToInstance(GetMetricRecordsChartDto, invalidData);
      const errors = await validate(dto, { skipMissingProperties: true });

      expect(errors.length).toBeGreaterThan(0);

      const errorProperties = errors.map((e) => e.property);
      expect(errorProperties).toContain('metricType');
      expect(errorProperties).toContain('time');
    });
  });
});
