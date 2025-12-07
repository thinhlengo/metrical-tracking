import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { UnitDto } from './dtos/unit.dto';

@Injectable()
export class UnitService {

  constructor(private readonly unitRepository: UnitRepository) {}

  list(): UnitDto[] {
    return this.unitRepository.list();
  }
}
