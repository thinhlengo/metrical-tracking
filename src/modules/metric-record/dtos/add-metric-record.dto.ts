import { Transform, Type } from "class-transformer";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { IsSupportedUnit } from "../../unit/validation/supported-unit/supported-unit";
import { RecordValueUnitRule } from "src/modules/unit/validation/record-value-unit/record-value-unit";

export class RecordValueDto {
  @IsNumber()
  @Type(() => Number)
  value: number;

  @IsString()
  @Transform(({ value, obj }) => {
    return value;
  })
  @IsSupportedUnit({ message: 'Unit must be one of the supported units' })
  unit: string;

  @IsDateString({}, { message: 'date must be a valid ISO 8601 date string' })
  date: string;

  @RecordValueUnitRule()
  private readonly _unitRule?: never;
}

export class CreateMetricRecordDto {
  @IsArray()
  @Type(() => RecordValueDto)
  @ValidateNested({ each: true })
  data: RecordValueDto[];
}