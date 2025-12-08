import { Transform, Type } from "class-transformer";
import { IsArray, IsDateString, IsNumber, IsString, ValidateNested } from "class-validator";
import { IsSupportedUnit } from "../validation/supported-unit";
import { RecordValueUnitRule } from "../validation/record-value-unit";
import { ApiProperty } from "@nestjs/swagger";

export class RecordValueDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @Type(() => Number)
  value: number;

  @ApiProperty({ type: String })
  @IsString()
  @Transform(({ value, obj }) => {
    return value;
  })
  @IsSupportedUnit({ message: 'Unit must be one of the supported units' })
  unit: string;

  @ApiProperty({ type: String })
  @IsDateString({}, { message: 'date must be a valid ISO 8601 date string' })
  date: string;

  @RecordValueUnitRule()
  private readonly _unitRule?: never;
}

export class CreateMetricRecordDto {
  @ApiProperty({ type: [RecordValueDto] })
  @IsArray()
  @Type(() => RecordValueDto)
  data: RecordValueDto[];
}