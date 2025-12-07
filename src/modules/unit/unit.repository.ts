import { Injectable } from "@nestjs/common";
import { DistanceUnit, TemperatureUnit, UnitDto } from "./dtos/unit.dto";
import { MetricType } from "../metric-record/metric-record.entity";

@Injectable()
export class UnitRepository {
  constructor() {}

  list(): UnitDto[] {
    const distanceUnits = Object.values(DistanceUnit);
    const distanceUnitsEntities = distanceUnits.map(unit => ({
      name: unit,
      symbol: unit,
      metricType: MetricType.DISTANCE,
    } as UnitDto));

    const temperatureUnits = Object.values(TemperatureUnit);
    const temperatureUnitsEntities = temperatureUnits.map(unit => ({
      name: unit,
      symbol: unit,
      metricType: MetricType.TEMPERATURE,
    } as UnitDto));
    return [...distanceUnitsEntities, ...temperatureUnitsEntities];
  }
}