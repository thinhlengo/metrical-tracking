import { MetricType } from "../metric-record.entity";

export class RecordDto {
  id: string;
  value: number;
  metricType: MetricType;
  unit: string;
  date: Date;
}