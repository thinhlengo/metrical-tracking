import { UnitService } from "src/modules/unit/unit.service";
import { RecordValueDto } from "../dtos/add-metric-record.dto";
import { MetricType } from "../metric-record.entity";
import { Injectable } from "@nestjs/common";
import { VALIDATION_MESSAGES } from "../../../common/message.constant";

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
        errors.push({ index: i, field: 'value', message: VALIDATION_MESSAGES.VALUE_REQUIRED });
      }

      if (!item.unit) {
        errors.push({ index: i, field: 'unit', message: VALIDATION_MESSAGES.UNIT_REQUIRED });
      }

      if (!item.date) {
        errors.push({ index: i, field: 'date', message: VALIDATION_MESSAGES.DATE_REQUIRED });
      }

      if (typeof item.value !== 'number') {
        errors.push({ index: i, field: 'value', message: VALIDATION_MESSAGES.VALUE_MUST_BE_NUMBER });
      }

      if (item.unit && !this.unitSet.has(item.unit)) {
        errors.push({ index: i, field: 'unit', message: VALIDATION_MESSAGES.INVALID_UNIT(item.unit) });
      }

      if (this.distanceUnits.has(item.unit) && item.value < 0) {
        errors.push({ index: i, field: 'value', message: VALIDATION_MESSAGES.DISTANCE_CANNOT_BE_NEGATIVE });
      }

      if (item.date && isNaN(Date.parse(item.date))) {
        errors.push({ index: i, field: 'date', message: VALIDATION_MESSAGES.INVALID_DATE_FORMAT });
      }
    }
    return errors;
  }
}

type ValidationErrorDto = {
  index: number;
  field: keyof RecordValueDto;
  message: string;
}