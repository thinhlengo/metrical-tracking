import { IsEnum, IsOptional, Max } from "class-validator";
import { Min } from "class-validator";
import { IsInt } from "class-validator";
import { MetricType } from "../metric-record.entity";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class GetMetricRecordsDto {
  @ApiProperty({ enum: MetricType })
  @IsEnum(MetricType)
  @IsOptional()
  metricType: MetricType = MetricType.DISTANCE;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  cursor?: string;

  @ApiProperty({ enum: ['next', 'previous'] })
  @IsOptional()
  @IsEnum(['next', 'previous'])
  direction?: 'next' | 'previous' = 'next';

  @ApiProperty({ type: Number, required: false, maximum: 1000, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  take?: number = 100;
}