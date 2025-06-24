import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsPositive, IsString, IsUrl, Length } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string; 

  @ApiProperty() 
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 1024)
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  cost?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  brandId?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  supplierId?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  typeId?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  stock?: number;
}