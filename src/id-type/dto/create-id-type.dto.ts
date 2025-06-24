import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MaxLength } from "class-validator";


export class CreateIdTypeDto {
  @ApiProperty()
  @IsString()
  @Length(1, 20)
  name: string;
}
