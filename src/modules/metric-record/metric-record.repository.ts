import { InjectRepository } from "@nestjs/typeorm";
import { MetricRecord } from "./metric-record.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { GetMetricRecordsDto } from "./dtos/get-metric-record.dto";

@Injectable()
export class MetricRecordRepository {
  constructor(
    @InjectRepository(MetricRecord)
    private readonly repository: Repository<MetricRecord>,
  ) {}

  async createMetricRecord(records: MetricRecord[]) {
    return this.repository.save(records);
  }

  async getMetricRecords(params: GetMetricRecordsDto): Promise<[MetricRecord[], number]> {
    const query = this.repository.createQueryBuilder()
      .where('"metricType" = :metricType', { metricType: params.metricType })
      .orderBy('"recordedAt"', 'DESC')

    if (params.cursor && params.cursor !== '') {
      const cursorSubQuery = this.repository.createQueryBuilder()
        .select(['"recordedAt"', 'id'])
        .where('id = :cursor')
        .orderBy('"recordedAt"', 'DESC')

      if (params.direction === 'next') {
        query.andWhere(`("recordedAt", "id") < (SELECT sb."recordedAt", sb."id" FROM (${cursorSubQuery.getQuery()}) AS sb)`);
      } else {
        query.andWhere(`("recordedAt", "id") > (SELECT sb."recordedAt", sb."id" FROM (${cursorSubQuery.getQuery()}) AS sb)`, );
      }
      query.setParameters({ cursor: params.cursor });

    }
    return query.take(params.take).getManyAndCount();
  }
}
