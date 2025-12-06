import { MetricType } from "../metric-record/metric-record.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum DistanceUnit {
  METER = 'm',
  CENTIMETER = 'cm',
  INCH = 'in',
  FEET = 'ft',
  YARD = 'yd',
}

export enum TemperatureUnit {
  CELSIUS = '°C',
  FAHRENHEIT = '°F',
  KELVIN = 'K',
}

export type UnitType = DistanceUnit | TemperatureUnit;

export type BaseUnitType = 'm' | '°C';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  metricType: MetricType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}