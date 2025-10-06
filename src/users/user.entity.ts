import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export type RolUsuario =
  | 'tienda-admin'
  | 'escuela-admin'
  | 'usuario-tienda'
  | 'usuario-escuela';

@Entity({ name: 'usuario' })
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // ahora usamos email como identificador único
  @Column({ length: 120 })
  email: string;

  // guardamos el hash de la contraseña
  @Column()
  passwordHash: string;

  // rol alineado con el front (4 roles)
  @Column({ type: 'varchar', length: 30 })
  role: RolUsuario;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
