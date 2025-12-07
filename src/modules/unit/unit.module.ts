import { Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { Unit } from './unit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitRepository } from './unit.repository';
import { RedisService } from '../../caching/redis/redis.service';
import { UnitConverterService } from './unit-converter/unit-converter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitController],
  providers: [UnitService, UnitRepository, RedisService, UnitConverterService],
  exports: [UnitService, UnitRepository, UnitConverterService]
})
export class UnitModule {}
