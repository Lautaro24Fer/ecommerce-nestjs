import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";

@Entity('product_image')
export class ProductImage{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text'})
    url: string;

    @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
    product: Product;
}