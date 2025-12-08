import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { UnitDto } from './dtos/unit.dto';

@Injectable()
export class UnitService {

  constructor(private readonly unitRepository: UnitRepository) {}

  list(): UnitDto[] {
    return this.unitRepository.list();
  }

  findBySymbol(symbol: string): UnitDto | undefined {
    if (!symbol) {
      return undefined;
    }

    const units = this.unitRepository.list();
    const unitMap = new Map(units.map(u => [u.symbol, u]));
    return unitMap.get(symbol) ?? undefined;
  }
}
