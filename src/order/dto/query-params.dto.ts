import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class QueryParamsDto {
  @ApiProperty({
    description: 'Fecha mínima para filtrar las órdenes',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  minDate: string;

  @ApiProperty({
    description: 'Fecha máxima para filtrar las órdenes',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  maxDate: string;
}