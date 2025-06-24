import { Product } from "src/product/entities/product.entity";

export interface ProductOrderDto {
  id: number;

  orderId: number;

  product: Product;

  quantity: number;
}