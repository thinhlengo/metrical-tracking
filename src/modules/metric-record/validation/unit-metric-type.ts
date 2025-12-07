import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UnitService } from "../../unit/unit.service";
import { GetMetricRecordsChartDto } from "../dtos/metric-record-chart.dto";

@ValidatorConstraint({ name: 'MetricTypeUnitRule', async: true })
@Injectable()
export class MetricTypeUnitRuleConstraint implements ValidatorConstraintInterface {
  constructor(private readonly unitService: UnitService) {}

  async validate(_: any, args: ValidationArguments): Promise<boolean> {
    const obj = args.object as GetMetricRecordsChartDto;

    if (!obj.unit) {
      return true;
    }

    const units = await this.unitService.list();
    const unit = units.find(unit => unit.symbol === obj.unit);

    if (unit?.metricType !== obj.metricType) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Unit must be of type "${(args.object as GetMetricRecordsChartDto)?.metricType}".`;
  }
}

export function MetricTypeUnitRule(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'MetricTypeUnitRule',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: MetricTypeUnitRuleConstraint,
      constraints: [UnitService],
      async: true,
    });
  };
}