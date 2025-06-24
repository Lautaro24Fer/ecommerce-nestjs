import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class FullUpdateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  surname: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsPhoneNumber('AR')
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(8, 50)
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;  

  @ApiProperty()
  @IsPositive()
  idType: number;

  @ApiProperty()
  @IsPositive()
  idNumber: number;

  @ApiProperty({ type: () => [AddressDto] })
  @ValidateNested({ each: true })  // Valida cada objeto dentro del array
  @Type(() => AddressDto)  
  address: AddressDto[];
}

export class PartialUpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber('AR')
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(8, 50)
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;  

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  idType?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  idNumber?: number;

  @ApiProperty({ type: () => [AddressDto] })
  @IsOptional()
  @ValidateNested({ each: true })  // Valida cada objeto dentro del array
  @Type(() => AddressDto)  
  address?: AddressDto[];
}

class AddressDto {

  @ApiProperty()
  @IsString()
  @Length(4, 10)
  postalCode: string;

  @ApiProperty()
  @IsString()
  @Length(1, 30)
  addressStreet: string;

  @ApiProperty()
  @IsString()
  @Length(1, 10)
  addressNumber: string;
}