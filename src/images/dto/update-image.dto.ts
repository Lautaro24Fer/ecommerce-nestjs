import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsPositive, IsString, Length, IsUrl, IsBoolean } from "class-validator";

export class UpdateImageDto {
  @ApiProperty()
	@IsOptional()
	@IsString()
  @IsUrl()
	url?: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	@IsPositive()
	productId?: number;
}
