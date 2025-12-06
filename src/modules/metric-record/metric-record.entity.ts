import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MetricType {
  DISTANCE = 'DISTANCE',
  TEMPERATURE = 'TEMPERATURE',
}

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
  source: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}