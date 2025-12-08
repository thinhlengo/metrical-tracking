import { Type } from "class-transformer";
import { IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RecordValueDto {
  @ApiProperty({ type: Number })
  value: number;

  @ApiProperty({ type: String })
  unit: string;

  @ApiProperty({ type: String })
  date: string;
}

export class CreateMetricRecordDto {
  @ApiProperty({ type: [RecordValueDto] })
  @IsArray()
  @Type(() => RecordValueDto)
  data: RecordValueDto[];
}