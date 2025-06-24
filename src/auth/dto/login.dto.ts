import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class InputLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginResponseDto {
  status: boolean;
  message: string;
  token?: any;

  constructor(status: boolean, message: string, token?: any) {
    this.status = status;
    this.message = message;
    this.token = token;
  }
}
