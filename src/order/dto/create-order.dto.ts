import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, Max, ValidateNested } from "class-validator";
import { MethodPaymentType } from "../../global/enum";

export class CreateOrderDto {
  @ApiProperty()
  @IsPositive()
  userId: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  addressId: number;

  @ApiProperty()
  @IsPositive()
  paymentId: number;

  @ApiProperty({ type: () => [ProductQuantity] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductQuantity)
  products: ProductQuantity[];

  @ApiProperty({ enum: MethodPaymentType, default: MethodPaymentType.MP_TRANSFER })
  @IsEnum(MethodPaymentType)
  paymentMethod: MethodPaymentType;

  // Pricing data

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  @Max(1.0)
  IVA?: number; // Porcentaje del iva aplicado (21% por defecto)
}

export class ProductQuantity {

  @ApiProperty()
  @IsPositive()
  productId: number;

  @ApiProperty()
  @IsPositive()
  quantity: number;
}