// src/ventas/ventas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './venta.entity';
import { VentaItem } from './venta-item.entity';
import { Libro } from '../libros/libro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, VentaItem, Libro])],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService], // opcional, útil si otro módulo necesita el servicio
})
export class VentasModule {}
