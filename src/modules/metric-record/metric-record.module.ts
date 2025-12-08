import { Module } from '@nestjs/common';
import { MetricRecordController } from './metric-record.controller';
import { MetricRecordService } from './metric-record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricRecord } from './metric-record.entity';
import { MetricRecordRepository } from './metric-record.repository';
import { UnitDto } from '../unit/dtos/unit.dto';
import { UnitModule } from '../unit/unit.module';
import { MetricTypeUnitRuleConstraint } from './validation/unit-metric-type';
import { RecordValueUnitRuleConstraint } from './validation/record-value-unit';
import { IsSupportedUnitConstraint } from './validation/supported-unit';
import { ValidationAddRecordService } from './validation/validation-add-record';

@Module({
  imports: [TypeOrmModule.forFeature([MetricRecord, UnitDto]), UnitModule],
  controllers: [MetricRecordController],
  providers: [MetricRecordService, MetricRecordRepository, MetricTypeUnitRuleConstraint, RecordValueUnitRuleConstraint, IsSupportedUnitConstraint, ValidationAddRecordService]
})
export class MetricRecordModule {}
