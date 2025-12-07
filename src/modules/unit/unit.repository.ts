import { Injectable } from "@nestjs/common";
import { Unit } from "./unit.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UnitRepository {
  constructor(
    @InjectRepository(Unit)
    private readonly repository: Repository<Unit>,
  ) {}

  async list(): Promise<Unit[]> {
    return this.repository.createQueryBuilder('unit')
      .select(['unit.id', 'unit.name', 'unit.symbol', 'unit.metricType'])
      .getMany()
  }
}