import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Libro } from './libro.entity';
import { LibrosService } from './libros.service';
import { LibrosController } from './libros.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Libro])],
  controllers: [LibrosController], // 👈 necesita estar
  providers: [LibrosService], // 👈 necesita estar
  exports: [LibrosService],
})
export class LibrosModule {}
