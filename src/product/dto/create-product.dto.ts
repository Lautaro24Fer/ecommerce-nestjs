import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  isURL,
  Length,
} from 'class-validator';
import { MulterFile } from '../../images/dto/multer-file';

export class CreateProductDto {
  @ApiProperty() 
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 1024)
  description: string;

  @IsOptional()
  image?: any;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number) // Convierte string a número
  price: number;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  cost: number;  

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number) // Convierte string a número
  brandId: number;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number) // Convierte string a número
  supplierId: number;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number) // Convierte string a número
  typeId: number;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number) // Convierte string a número
  stock: number;
}
