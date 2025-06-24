import { ApiProperty } from "@nestjs/swagger";
import { Address } from "src/address/entities/address.entity";
import { Product } from "src/product/entities/product.entity";
import { UserDto } from "src/user/dto/user.dto";
import { ProductOrder } from "../entities/order.entity";
import { ProductOrderDto } from "./product-order.dto";

export class OrderDto{

  user: UserDto;

  destination: Address;

  paymentId: string;

  items: ProductOrderDto[];

  netPrice: number;

  IVA: number;

  total: number;

  profit: number;
}

export class OrderQueryParams {
  minDate: Date;
  maxDate: Date;
}