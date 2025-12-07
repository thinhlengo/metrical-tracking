import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateMetricRecordDto } from './dtos/add-metric-record.dto';
import { MetricRecordRepository } from './metric-record.repository';
import { ClientRMQ } from '@nestjs/microservices';
import { UnitService } from '../unit/unit.service';
import { DistanceUnit, TemperatureUnit, Unit } from '../unit/unit.entity';
import { MetricRecord, MetricType } from './metric-record.entity';
import { METRICAL_RECORD_CREATE_MESSAGE } from '../../rabbitmq/message.constant';
import { METRICAL_SERVICE } from '../../rabbitmq/rabbitmq.module';
import { UnitConverterService } from '../unit/unit-converter/unit-converter.service';

@Injectable()
export class MetricRecordService {
  private readonly logger = new Logger(MetricRecordService.name);

  constructor(
    private readonly metricRecordRepository: MetricRecordRepository,
    private readonly unitService: UnitService,
    private readonly unitConverterService: UnitConverterService,
    @Inject(METRICAL_SERVICE) private readonly clientRMQ: ClientRMQ,
  ) {}

  async createMetricRecord(payload: CreateMetricRecordDto): Promise<boolean> {
    const batchSize = 3000;
    let index = 0;
    while (index < payload.data.length) {
      const batch = payload.data.slice(index, index + batchSize);

      this.logger.log(`Creating metric records ${index} of ${payload.data.length}`);

      this.clientRMQ
        .emit(METRICAL_RECORD_CREATE_MESSAGE, {
          data: batch
        })
        .subscribe({
          next: (value) => {
            this.logger.log(`Metric records created ${index} of ${payload.data.length}`);
          },
          error: (error) => {
            this.logger.error(`Error creating metric records ${index} of ${payload.data.length}`, error);
          },
          complete: () => {
            this.logger.log(`Metric records created ${index} of ${payload.data.length}`);
          },
        });

      index += batchSize;
    }
    return true;
  }

  async createMetricRecordMQ(payload: CreateMetricRecordDto) {
    const units = await this.unitService.list();
    const unitMap = new Map<string, Unit>(
      units.map((unit) => [unit.symbol, unit]),
    );

    const records = payload.data.map((item) => {
      const record = new MetricRecord();
      const unit = unitMap.get(item.unit);

      let baseValue: number | undefined;
      if (unit?.metricType === MetricType.DISTANCE) {
        baseValue = this.unitConverterService.convertDistance(
          item.value,
          unit!.symbol as DistanceUnit,
          DistanceUnit.METER,
        );
      } else if (unit?.metricType === MetricType.TEMPERATURE) {
        baseValue = this.unitConverterService.convertTemperature(
          item.value,
          unit!.symbol as TemperatureUnit,
          TemperatureUnit.CELSIUS,
        );
      }

      record.value = baseValue!;
      record.metricType = unit!.metricType;
      record.source = item;
      record.recordedAt = new Date(item.date);

      return record;
    });

    const createdRecords = await this.metricRecordRepository.createMetricRecord(records);

    return createdRecords;
  }
}
