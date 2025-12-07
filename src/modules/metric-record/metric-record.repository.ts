import { InjectRepository } from "@nestjs/typeorm";
import { MetricRecord } from "./metric-record.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MetricRecordRepository {
  constructor(
    @InjectRepository(MetricRecord)
    private readonly repository: Repository<MetricRecord>,
  ) {}

  async createMetricRecord(records: MetricRecord[]) {
    return this.repository.save(records);
  }

}
