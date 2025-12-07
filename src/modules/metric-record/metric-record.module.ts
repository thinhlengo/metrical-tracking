import { Module } from '@nestjs/common';
import { MetricRecordController } from './metric-record.controller';
import { MetricRecordService } from './metric-record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricRecord } from './metric-record.entity';
import { MetricRecordRepository } from './metric-record.repository';
import { Unit } from '../unit/unit.entity';
import { UnitModule } from '../unit/unit.module';

@Module({
  imports: [TypeOrmModule.forFeature([MetricRecord, Unit]), UnitModule],
  controllers: [MetricRecordController],
  providers: [MetricRecordService, MetricRecordRepository]
})
export class MetricRecordModule {}
