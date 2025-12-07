import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UnitService } from '../../unit/unit.service';


@ValidatorConstraint({ name: 'IsSupportedUnit', async: true })
@Injectable()
export class IsSupportedUnitConstraint implements ValidatorConstraintInterface {
  constructor(private readonly unitService: UnitService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (value === null || value === undefined || value === '') return true;
    
    const units = await this.unitService.list();
    return units.some(unit => unit.symbol === value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Unit "$value" is not supported`;
  }
}

export function IsSupportedUnit(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedUnit',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsSupportedUnitConstraint,
      async: true,
      constraints: [UnitService],
    });
  };
}
