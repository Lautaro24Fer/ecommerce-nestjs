import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateBrandDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name: string;
}
