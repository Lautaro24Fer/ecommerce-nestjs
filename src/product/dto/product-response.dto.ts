import { ProductImageResponseDto } from "src/images/dto/image-response.dto";

export class ProductResponseDto{
  name: string;
  image: string;
  description: string;
  secondariesImages?: ProductImageResponseDto[] | [];
  price: number;
  brandId: number;
  supplierId: number;
  typeId: number;
}