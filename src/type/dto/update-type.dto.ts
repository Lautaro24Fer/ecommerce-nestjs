import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateTypeDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(1, 50)
    name: string;
}