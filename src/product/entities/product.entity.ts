import { Brand } from '../../brand/entities/brand.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductType } from '../../type/entities/type.entity';
import { ProductImage } from '../../images/entities/image.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  isActive: boolean;
  // Pricing

  @Column('decimal', { precision: 10, scale: 2})
  price: number; // Precio base del producto

  @Column('decimal', { precision: 10, scale: 2})
  cost: number; // Precio de costo para calcular ganancia

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  image: string;

  @OneToMany(() => ProductImage, (image) => image.product, { onDelete: 'CASCADE' })
  secondariesImages: ProductImage[]

  @ManyToOne(() => ProductType, (type) => type.id)
  type: ProductType;

  @ManyToOne(() => Brand, (brand) => brand.id)
  brand: Brand;

  @ManyToOne(() => Supplier, (supplier) => supplier.id)
  supplier: Supplier;
}
