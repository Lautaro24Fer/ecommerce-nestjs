import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, IsUrl, Length, ValidateNested } from "class-validator";
import { MulterFile } from "./multer-file";


export class CreateImageDto {
  @ApiProperty({ type: [MulterFile] })
	@IsNotEmpty()
	@ValidateNested({ each: true })
	multerFile: MulterFile;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	productId: number;
}
