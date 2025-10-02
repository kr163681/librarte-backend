import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Libro } from '../libros/libro.entity';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Libro, { eager: true, nullable: false })
  libro: Libro;

  @Column('int')
  cantidad: number;

  @Column('numeric', { precision: 10, scale: 2 })
  precioUnitario: string; // guardamos como string para no perder precisión decimal

  @Column('numeric', { precision: 12, scale: 2 })
  total: string;

  @CreateDateColumn()
  fecha: Date; // se setea automáticamente
}
