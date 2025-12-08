import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMetricRecordDto, RecordValueDto } from './add-metric-record.dto';

describe('CreateMetricRecordDto', () => {
  describe('valid DTO', () => {
    it('should pass validation with correct data', async () => {
      const validData = {
        data: [
          {
            value: 100,
            unit: 'kg',
            date: '2025-12-07T10:00:00.000Z',
          },
        ],
      };

      const dto = plainToInstance(CreateMetricRecordDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with multiple records', async () => {
      const validData = {
        data: [
          { value: 100, unit: 'kg', date: '2025-12-07T10:00:00.000Z' },
          { value: 50, unit: 'm', date: '2025-12-08T10:00:00.000Z' },
        ],
      };

      const dto = plainToInstance(CreateMetricRecordDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty array', async () => {
      const validData = { data: [] };

      const dto = plainToInstance(CreateMetricRecordDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('invalid DTO', () => {
    it('should fail validation when data is not an array', async () => {
      const invalidData = { data: 'not-an-array' };

      const dto = plainToInstance(CreateMetricRecordDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('data');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail validation when data is missing', async () => {
      const invalidData = {};

      const dto = plainToInstance(CreateMetricRecordDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('data');
    });

    it('should fail validation when data is null', async () => {
      const invalidData = { data: null };

      const dto = plainToInstance(CreateMetricRecordDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('class transformation', () => {
    it('should transform plain object to CreateMetricRecordDto instance', () => {
      const plainData = {
        data: [{ value: 100, unit: 'kg', date: '2025-12-07T10:00:00.000Z' }],
      };

      const dto = plainToInstance(CreateMetricRecordDto, plainData);

      expect(dto).toBeInstanceOf(CreateMetricRecordDto);
      expect(dto.data).toBeDefined();
      expect(dto.data.length).toBe(1);
    });

    it('should transform nested data array to RecordValueDto instances', () => {
      const plainData = {
        data: [{ value: 100, unit: 'kg', date: '2025-12-07T10:00:00.000Z' }],
      };

      const dto = plainToInstance(CreateMetricRecordDto, plainData);

      expect(dto.data[0]).toBeInstanceOf(RecordValueDto);
      expect(dto.data[0].value).toBe(100);
      expect(dto.data[0].unit).toBe('kg');
      expect(dto.data[0].date).toBe('2025-12-07T10:00:00.000Z');
    });
  });
});
