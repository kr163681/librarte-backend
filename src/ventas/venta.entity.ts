import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { VentaItem } from './venta-item.entity';

@Index(['fecha'])
@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fecha: Date;

  // Guardamos como string (DECIMAL/NUMERIC en DB) para no perder precisión
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @OneToMany(() => VentaItem, (item) => item.venta, { cascade: true })
  items: VentaItem[];
}
