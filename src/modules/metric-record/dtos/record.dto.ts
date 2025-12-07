import { ApiProperty } from "@nestjs/swagger";
import { MetricType } from "../metric-record.entity";

export class RecordDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  value: number;

  @ApiProperty({ enum: MetricType })
  metricType: MetricType;

  @ApiProperty({ type: String })
  unit: string;

  @ApiProperty({ type: Date })
  date: Date;
}

export class RecordChartDto {
  @ApiProperty({ type: Date })
  date: Date;
  
  @ApiProperty({ type: Number })
  value: number;

  @ApiProperty({ type: String })
  unit: string;
}