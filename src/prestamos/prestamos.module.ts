import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { Prestamo } from './prestamo.entity';
import { Libro } from '../libros/libro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamo, Libro])],
  controllers: [PrestamosController],
  providers: [PrestamosService],
  exports: [PrestamosService],
})
export class PrestamosModule {}
