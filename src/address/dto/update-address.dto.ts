import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateAddressDto {

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 10)
  postalCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  addressStreet: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 10)
  addressNumber: string;
}
