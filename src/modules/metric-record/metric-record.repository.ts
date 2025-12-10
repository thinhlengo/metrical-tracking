import { InjectRepository } from "@nestjs/typeorm";
import { MetricRecord } from "./metric-record.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { GetMetricRecordsDto } from "./dtos/get-metric-record.dto";
import { GetMetricRecordsChartDto } from "./dtos/metric-record-chart.dto";

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
    const query = this.repository.createQueryBuilder('mr')
      .select(['"recordedAt"', 'mr.id', 'mr.value', '"metricType"', 'mr.source'])
      .where('mr."metricType" = :metricType', { metricType: params.metricType })
      .orderBy('mr."recordedAt"', 'DESC')

    if (params.cursor && params.cursor !== '') {
      const cursorSubQuery = this.repository.createQueryBuilder()
        .select(['"recordedAt"', 'id'])
        .where('id = :cursor')
        .orderBy('"recordedAt"', 'DESC')

      if (params.direction === 'next') {
        query.andWhere(`(mr."recordedAt", mr."id") < (SELECT sb."recordedAt", sb."id" FROM (${cursorSubQuery.getQuery()}) AS sb)`);
      } else {
        query.andWhere(`(mr."recordedAt", mr."id") > (SELECT sb."recordedAt", sb."id" FROM (${cursorSubQuery.getQuery()}) AS sb)`, );
      }
      query.setParameters({ cursor: params.cursor });

    }
    return query.take(params.take)
      .getManyAndCount();
  }

  async getMetricRecordsChart(params: GetMetricRecordsChartDto): Promise<MetricRecord[]> {
    const sql = `
      WITH RECURSIVE dates AS (
        (SELECT DATE(mr."recordedAt") as d
        FROM metric_records mr
        WHERE mr."metricType" = $1 AND mr."recordedAt" >= $2 AND mr."recordedAt" <= $3
        ORDER BY mr."recordedAt" DESC
        LIMIT 1)
        UNION ALL
        SELECT (
          SELECT DATE(mr."recordedAt")
          FROM metric_records mr
          WHERE mr."metricType" = $1
            AND DATE(mr."recordedAt") < dates.d AND mr."recordedAt" >= $2
          ORDER BY mr."recordedAt" DESC
          LIMIT 1
        )
        FROM dates
        WHERE dates.d IS NOT NULL
      )
      SELECT mt.*
      FROM dates d
      JOIN LATERAL (
        SELECT mr."recordedAt", mr."id", mr."value", mr."metricType", mr."source"
        FROM metric_records mr
        WHERE mr."metricType" = $1  AND DATE(mr."recordedAt") = d.d
        ORDER BY mr."createdAt" DESC
        LIMIT 1
      ) mt ON true
      WHERE d.d IS NOT NULL`
    const result = await this.repository.query(sql, [params.metricType, params.dates[0], params.dates[1]]);
    return result;
  }
}
