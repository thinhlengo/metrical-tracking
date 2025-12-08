import { UnitService } from "src/modules/unit/unit.service";
import { RecordValueDto } from "../dtos/add-metric-record.dto";
import { UnitDto } from "src/modules/unit/dtos/unit.dto";
import { MetricType } from "../metric-record.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ValidationAddRecordService {
  private unitSet: Set<string>;
  private distanceUnits: Set<string>;
  
  constructor(private readonly unitService: UnitService) {
    const units = this.unitService.list();
    this.unitSet = new Set(units.map(u => u.symbol));
    this.distanceUnits = new Set(
      units.filter(u => u.metricType === MetricType.DISTANCE).map(u => u.symbol)
    );
  }

  public validateRecords(data: RecordValueDto[]): ValidationErrorDto[] {
    const errors: ValidationErrorDto[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.value === undefined || item.value === null) {
        errors.push({ index: i, field: 'value', message: 'value is required' });
      }

      if (!item.unit) {
        errors.push({ index: i, field: 'unit', message: 'unit is required' });
      }

      if (!item.date) {
        errors.push({ index: i, field: 'date', message: 'date is required' });
      }

      if (typeof item.value !== 'number') {
        errors.push({ index: i, field: 'value', message: 'value must be a number' });
      }

      if (item.unit && !this.unitSet.has(item.unit)) {
        errors.push({ index: i, field: 'unit', message: `Invalid unit: ${item.unit}` });
      }

      if (this.distanceUnits.has(item.unit) && item.value < 0) {
        errors.push({ index: i, field: 'value', message: 'Distance cannot be negative' });
      }

      if (item.date && isNaN(Date.parse(item.date))) {
        errors.push({ index: i, field: 'date', message: 'Invalid date format' });
      }
    }
    return errors;
  }
}

type ValidationErrorDto = {
  index: number;
  field: string;
  message: string;
}