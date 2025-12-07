import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMetricRecordDto } from './add-metric-record.dto';

jest.mock('../validation/supported-unit', () => ({
  IsSupportedUnitConstraint: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockResolvedValue(true),
  })),
  IsSupportedUnit: () => () => {},
}));

jest.mock('../validation/record-value-unit', () => ({
  RecordValueUnitRuleConstraint: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockResolvedValue(true),
  })),
  RecordValueUnitRule: () => () => {},
}));

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
  });

  describe('invalid DTO', () => {
    it('should fail validation with incorrect data', async () => {
      const invalidData = {
        data: [
          {
            value: 'not-a-number',
            unit: 123,
            date: 'invalid-date',
          },
        ],
      };

      const dto = plainToInstance(CreateMetricRecordDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
