import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Libro } from './libro.entity';
import { LibrosService } from './libros.service';
import { LibrosController } from './libros.controller';
import { Categoria } from '../categorias/categorias.entity';

@Module({
  // 👇 Registramos también Categoria porque LibrosService la inyecta
  imports: [TypeOrmModule.forFeature([Libro, Categoria])],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService], // (no necesitas exportar TypeOrmModule salvo que otro módulo lo requiera)
})
export class LibrosModule {}
