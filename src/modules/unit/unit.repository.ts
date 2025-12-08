import { Injectable } from "@nestjs/common";
import { DistanceUnit, TemperatureUnit, UnitDto } from "./dtos/unit.dto";
import { MetricType } from "../metric-record/metric-record.entity";

@Injectable()
export class UnitRepository {
  constructor() {}

  list(): UnitDto[] {
    const unitConfigs = [
      { units: Object.values(DistanceUnit), metricType: MetricType.DISTANCE },
      { units: Object.values(TemperatureUnit), metricType: MetricType.TEMPERATURE },
    ];
  
    return unitConfigs.flatMap(({ units, metricType }) =>
      units.map(unit => ({ name: unit, symbol: unit, metricType }))
    );
  }
}