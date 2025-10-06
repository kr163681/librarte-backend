import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Venta } from './venta.entity';
import { Libro } from '../libros/libro.entity';

@Entity()
export class VentaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;

  @Column()
  ventaId: number;

  @ManyToOne(() => Libro, { eager: true, nullable: false })
  @JoinColumn({ name: 'libroId' })
  libro: Libro;

  @Column()
  libroId: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precioUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;
}
