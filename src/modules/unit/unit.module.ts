import { Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { Unit } from './unit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitRepository } from './unit.repository';
import { RedisService } from '../../caching/redis/redis.service';
import { IsSupportedUnitConstraint } from './validation/supported-unit/supported-unit';
import { UnitConverterService } from './unit-converter/unit-converter.service';
import { RecordValueUnitRuleConstraint } from './validation/record-value-unit/record-value-unit';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitController],
  providers: [UnitService, UnitRepository, RedisService, IsSupportedUnitConstraint, RecordValueUnitRuleConstraint, UnitConverterService],
  exports: [UnitService, UnitRepository, IsSupportedUnitConstraint, RecordValueUnitRuleConstraint, UnitConverterService]
})
export class UnitModule {}
