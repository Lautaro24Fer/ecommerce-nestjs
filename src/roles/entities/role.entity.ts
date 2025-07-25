import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 50 })
	name: string;
}
