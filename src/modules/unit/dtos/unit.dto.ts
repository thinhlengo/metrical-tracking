import { MetricType } from "../../metric-record/metric-record.entity"; 

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

export class UnitDto {
  name: string;
  symbol: string;
  metricType: MetricType;
}