import { IsEnum, IsOptional, Max } from "class-validator";
import { Min } from "class-validator";
import { IsInt } from "class-validator";
import { MetricType } from "../metric-record.entity";
import { Type } from "class-transformer";

export class GetMetricRecordsDto {
  @IsEnum(MetricType)
  @IsOptional()
  metricType: MetricType = MetricType.DISTANCE;

  @IsOptional()
  cursor?: string;

  @IsOptional()
  @IsEnum(['next', 'previous'])
  direction?: 'next' | 'previous' = 'next';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  take?: number = 100;
}