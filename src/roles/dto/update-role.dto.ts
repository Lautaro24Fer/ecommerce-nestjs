import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateRoleDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(1, 50)
    name: string;
}
