import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UnitService } from '../../unit/unit.service';


@ValidatorConstraint({ name: 'IsSupportedUnit', async: false })
@Injectable()
export class IsSupportedUnitConstraint implements ValidatorConstraintInterface {
  constructor(private readonly unitService: UnitService) {}

  validate(value: any, args: ValidationArguments): boolean {
    if (value === null || value === undefined || value === '') return true;
    
    const unit = this.unitService.findBySymbol(value);
    if (!unit) {
      return false;
    }

    return true;
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
