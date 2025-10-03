import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type TipoInventario = 'publica' | 'tienda';

@Entity()
export class Libro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  autor: string;

  // Para biblioteca pública: indica si está prestable o no
  @Column({ default: true })
  disponible: boolean;

  // Tipo de inventario: pública o tienda
  @Column({ type: 'varchar', length: 10, default: 'publica' })
  tipo: TipoInventario;

  // Stock (solo aplica a tienda). En pública es null.
  @Column({ type: 'int', nullable: true })
  stock: number | null;

  // 💰 Nuevo: precio (solo aplica a tienda). En pública es null.
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  precio: string | null;
}
