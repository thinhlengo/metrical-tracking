import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DistanceUnit, TemperatureUnit } from '../unit.entity';

@Injectable()
export class UnitConverterService {
  private readonly logger = new Logger(UnitConverterService.name);
  private readonly distanceFactors = {
    [DistanceUnit.METER]: 1,
    [DistanceUnit.CENTIMETER]: 0.01,
    [DistanceUnit.INCH]: 0.0254,
    [DistanceUnit.FEET]: 0.3048,
    [DistanceUnit.YARD]: 0.9144,
  };

  convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
    try {
      const meters = value * this.distanceFactors[from];
      return meters / this.distanceFactors[to];
    } catch (error) {
      this.logger.error(`Error converting distance: ${error} ${value} ${from} ${to}`);
      throw error;
    }
  }

  convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
    let celsius: number;
    switch (from) {
      case TemperatureUnit.CELSIUS:
        celsius = value;
        break;
      case TemperatureUnit.FAHRENHEIT:
        celsius = (value - 32) * 5 / 9;
        break;
      case TemperatureUnit.KELVIN:
        celsius = value - 273.15;
        break;
      default:
        this.logger.error(`Unknown temperature unit: ${from}`);
        throw new Error(`Unknown temperature unit: ${from}`);
    }

    switch (to) {
      case TemperatureUnit.CELSIUS:
        return celsius;
      case TemperatureUnit.FAHRENHEIT:
        return (celsius * 9 / 5) + 32;
      case TemperatureUnit.KELVIN:
        return celsius + 273.15;
      default:
        this.logger.error(`Unknown temperature unit: ${to}`);
        throw new Error(`Unknown temperature unit: ${to}`);
    }
  }

  convert(value: number, from: string, to: string): number {
    if (from === to) return value;
    
    if (Object.values(DistanceUnit).includes(from as DistanceUnit) &&
        Object.values(DistanceUnit).includes(to as DistanceUnit)) {
      return this.convertDistance(value, from as DistanceUnit, to as DistanceUnit);
    }

    if (Object.values(TemperatureUnit).includes(from as TemperatureUnit) &&
        Object.values(TemperatureUnit).includes(to as TemperatureUnit)) {
      return this.convertTemperature(value, from as TemperatureUnit, to as TemperatureUnit);
    }

    throw new Error(`Invalid unit conversion requested: ${from} to ${to}`);
  }
}
