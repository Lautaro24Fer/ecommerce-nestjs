import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsPositive, IsString } from "class-validator";

export class QueryParamsBrandDto{

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null), {
    toClassOnly: true,
  })
  @IsPositive()
  limit?: number;
}