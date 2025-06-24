import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class UpdateIdTypeDto{
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  name?: string;
}
