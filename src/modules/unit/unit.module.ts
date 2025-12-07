import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitRepository } from './unit.repository';
import { UnitConverterService } from './unit-converter/unit-converter.service';

@Module({
  imports: [],
  controllers: [],
  providers: [UnitService, UnitRepository, UnitConverterService],
  exports: [UnitService, UnitRepository, UnitConverterService]
})
export class UnitModule {}
