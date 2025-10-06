import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';
import { Libro } from '../libros/libro.entity';

@Entity('categorias')
@Unique(['nombre'])
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @OneToMany(() => Libro, (libro) => libro.categoria)
  libros: Libro[];
}
