import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'Name of the product',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string | null | undefined;

  @ApiPropertyOptional({
    description: 'Name of the product',
    type: String,
  })
  @IsOptional()
  isActive?: string | null | undefined;

  @ApiPropertyOptional({
    description: 'Minium price of the product',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null), {
    toClassOnly: true,
  })
  @IsPositive()
  minPrice?: number | null | undefined;

  @ApiPropertyOptional({
    description: 'Maxium price of the product',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null), {
    toClassOnly: true,
  })
  @IsPositive()
  maxPrice?: number | null | undefined;

  @ApiPropertyOptional({
    description: 'Exact price of the product',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null), {
    toClassOnly: true,
  })
  @IsPositive()
  price?: number | null | undefined;

  @ApiPropertyOptional({
    description: 'Exact price of the product',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null), {
    toClassOnly: true,
  })
  @IsPositive()
  limit?: number | null | undefined;

  @ApiPropertyOptional({
    description: 'Brand of the product',
    type: String,
  })
  @IsOptional()
  @IsString()
  brand?: string | null | undefined;

  @ApiPropertyOptional({
    description: 'Type of the product',
    type: String
  })
  @IsOptional()
  @IsString()
  type?: string | null | undefined;

  @ApiPropertyOptional({
    description: 'Minimum stock of the product',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null), {
    toClassOnly: true,
  })
  @IsPositive()
  minStock?: number | null | undefined;
}
