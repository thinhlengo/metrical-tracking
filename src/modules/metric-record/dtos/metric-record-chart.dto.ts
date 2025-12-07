import { IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { MetricType } from "../metric-record.entity";
import { IsSupportedUnit } from "src/modules/unit/validation/supported-unit/supported-unit";

export enum TimeInterval {
  ONE_MONTH = '1 month',
  TWO_MONTHS = '2 months',
}

export class GetMetricRecordsChartDto {
  @IsEnum(MetricType)
  @IsOptional()
  metricType: MetricType = MetricType.DISTANCE;

  @IsString()
  @IsSupportedUnit({ message: 'Unit must be one of the supported units' })
  unit: string;

  @IsIn([TimeInterval.ONE_MONTH, TimeInterval.TWO_MONTHS])
  time: TimeInterval = TimeInterval.ONE_MONTH;

  get dates(): [Date, Date] {
    const end = new Date();
    const start = new Date(end);

    if (this.time === TimeInterval.TWO_MONTHS) {
      start.setMonth(start.getMonth() - 2);
    } else {
      start.setMonth(start.getMonth() - 1);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return [start, end];
  }
}