import { Module } from '@nestjs/common';
import { MetricRecordController } from './metric-record.controller';
import { MetricRecordService } from './metric-record.service';

@Module({
  controllers: [MetricRecordController],
  providers: [MetricRecordService]
})
export class MetricRecordModule {}
