import { Controller, Get } from '@nestjs/common';
import { UnitService } from './unit.service';

@Controller('unit')
export class UnitController {

  constructor(private readonly unitService: UnitService) {}
  
  @Get()
  getUnits() {
    return this.unitService.list();
  }
}
