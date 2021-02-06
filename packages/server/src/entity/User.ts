import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255 })
  firstName: string;

  @Column("varchar", { length: 255 })
  lastName: string;

  @Column("varchar", { length: 255, unique: true })
  email: string;

  @Column("text") // Passwords will be hashed therefore set type as "text"
  password: string;
}
