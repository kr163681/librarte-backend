import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './venta.entity';
import { Libro } from '../libros/libro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Libro])],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
