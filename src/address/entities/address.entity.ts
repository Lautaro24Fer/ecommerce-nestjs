import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity("address")
export class Address {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  postalCode: string;

  @Column({ length: 30 })
  addressStreet: string;

  @Column({ length: 10 })
  addressNumber: string;

  @ManyToMany(() => User, (user) => user.address)
  user: User[];
}
