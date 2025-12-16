import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { RecordValueDto } from "./dtos/add-metric-record.dto";

export enum MetricType {
  DISTANCE = 'DISTANCE',
  TEMPERATURE = 'TEMPERATURE',
}

@Index(['metricType'])
@Index(['metricType', 'recordedAt', 'createdAt'])
@Index(['metricType', 'recordedAt'])
@Index(['id', 'recordedAt'])
@Entity('metric_records')
export class MetricRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Value in base unit */
  @Column({ type: 'decimal', precision: 20, scale: 10 })
  value: number;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  metricType: MetricType;

  @Column({ type: 'jsonb', nullable: true })
  source: RecordValueDto;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}