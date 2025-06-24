import { Address } from '../../address/entities/address.entity';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  paymentId: string;

  @ManyToOne(() => Address, (address) => address.id)
  address: Address;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreated: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => ProductOrder, (po) => po.order, { onDelete: 'CASCADE' })
  productOrder: ProductOrder[];

  @Column({ type: 'varchar', default: "MP_TRANSFER" })
  paymentMethod: string;

  // Pricing data

  @Column('decimal', { precision: 10, scale: 2 })
  netPrice: number; // Precio sin IVA

  @Column('decimal', { precision: 10, scale: 2, default: 0.21 })
  IVA: number; // IVA aplicado

  @Column('decimal', { precision: 10, scale: 2 })
  total: number; // Precio total con IVA

  // En caso que halla que tener en cuenta la comision por transaccion de MP
  // @Column('decimal', { precision: 10, scale: 2 })
  // marketplaceFee: number; // Porcentaje retenido por Mercado Pago

  @Column('decimal', { precision: 10, scale: 2 })
  profit: number; // Ganancia final después de impuestos y retenciones

}

@Entity('product-order')
export class ProductOrder {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.productOrder, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
