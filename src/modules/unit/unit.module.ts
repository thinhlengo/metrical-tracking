import { Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { UnitDto } from './dtos/unit.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitRepository } from './unit.repository';
import { UnitConverterService } from './unit-converter/unit-converter.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitDto])],
  controllers: [UnitController],
  providers: [UnitService, UnitRepository, UnitConverterService],
  exports: [UnitService, UnitRepository, UnitConverterService]
})
export class UnitModule {}
