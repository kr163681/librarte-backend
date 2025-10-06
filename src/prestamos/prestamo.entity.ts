import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Libro } from '../libros/libro.entity';

@Entity()
export class Prestamo {
  @PrimaryGeneratedColumn()
  id: number;

  // quién pidió el libro (puede ser nombre o ID de usuario)
  @Column({ length: 120 })
  usuario: string;

  // fecha en la que se hace el préstamo
  @Column({ type: 'date' })
  fechaPrestamo: string;

  // fecha prevista de devolución
  @Column({ type: 'date', nullable: true })
  fechaDevolucion: string | null;

  // flag si ya se devolvió
  @Column({ default: false })
  devuelto: boolean;

  // relación: muchos préstamos pertenecen a un libro
  @ManyToOne(() => Libro, { eager: true, nullable: false })
  libro: Libro;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
