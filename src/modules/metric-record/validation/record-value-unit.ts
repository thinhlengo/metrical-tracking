
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UnitService } from '../../unit/unit.service';
import { RecordValueDto } from 'src/modules/metric-record/dtos/add-metric-record.dto';
import { MetricType } from '../../metric-record/metric-record.entity';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'RecordValueUnitRule', async: false })
@Injectable()
export class RecordValueUnitRuleConstraint implements ValidatorConstraintInterface {
  constructor(private readonly unitService: UnitService) {}

  validate(_: any, args: ValidationArguments): boolean {
    const obj = args.object as RecordValueDto;

    const units = this.unitService.list();
    const unit = units.find(unit => unit.symbol === obj.unit);

    if (unit?.metricType === MetricType.DISTANCE && obj.value < 0) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Value cannot be negative when unit is "${(args.object as RecordValueDto)?.unit}".`;
  }
}

export function RecordValueUnitRule(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'RecordValueUnitRule',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: RecordValueUnitRuleConstraint,
      constraints: [UnitService],
      async: false,
    });
  };
}