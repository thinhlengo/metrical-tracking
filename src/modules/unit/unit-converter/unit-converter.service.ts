import { Injectable, Logger } from '@nestjs/common';
import { DistanceUnit, TemperatureUnit } from '../dtos/unit.dto';
import { CONVERT_UNIT_ERROR_MESSAGES } from '../../../common/message.constant';

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
      this.logger.error(CONVERT_UNIT_ERROR_MESSAGES.ERROR_CONVERTING_DISTANCE(error, value, from, to));
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
        this.logger.error(CONVERT_UNIT_ERROR_MESSAGES.UNKNOWN_TEMPERATURE_UNIT(from));
        throw new Error(CONVERT_UNIT_ERROR_MESSAGES.UNKNOWN_TEMPERATURE_UNIT(from));
    }

    switch (to) {
      case TemperatureUnit.CELSIUS:
        return celsius;
      case TemperatureUnit.FAHRENHEIT:
        return (celsius * 9 / 5) + 32;
      case TemperatureUnit.KELVIN:
        return celsius + 273.15;
      default:
        this.logger.error(CONVERT_UNIT_ERROR_MESSAGES.UNKNOWN_TEMPERATURE_UNIT(to));
        throw new Error(CONVERT_UNIT_ERROR_MESSAGES.UNKNOWN_TEMPERATURE_UNIT(to));
    }
  }
}
