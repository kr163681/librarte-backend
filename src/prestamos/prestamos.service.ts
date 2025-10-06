import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from './prestamo.entity';
import { Libro } from '../libros/libro.entity';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamosRepo: Repository<Prestamo>,
    @InjectRepository(Libro)
    private readonly librosRepo: Repository<Libro>,
  ) {}

  // Crear préstamo
  async create(dto: CreatePrestamoDto) {
    const libro = await this.librosRepo.findOne({ where: { id: dto.libroId } });
    if (!libro) throw new NotFoundException('Libro no encontrado');

    if (!libro.disponible) {
      throw new BadRequestException('El libro ya está prestado');
    }

    libro.disponible = false;
    await this.librosRepo.save(libro);

    const prestamo = this.prestamosRepo.create({
      usuario: dto.usuario,
      fechaPrestamo: dto.fechaPrestamo,
      fechaDevolucion: dto.fechaDevolucion,
      devuelto: dto.devuelto ?? false,
      libro,
    });

    return this.prestamosRepo.save(prestamo);
  }

  // Obtener todos
  findAll() {
    return this.prestamosRepo.find();
  }

  // Obtener uno
  async findOne(id: number) {
    const prestamo = await this.prestamosRepo.findOne({ where: { id } });
    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');
    return prestamo;
  }

  // Actualizar (ej: marcar como devuelto)
  async update(id: number, dto: UpdatePrestamoDto) {
    const prestamo = await this.findOne(id);

    Object.assign(prestamo, dto);
    const actualizado = await this.prestamosRepo.save(prestamo);

    // Si se marcó como devuelto -> liberar libro
    if (dto.devuelto === true && prestamo.libro) {
      prestamo.libro.disponible = true;
      await this.librosRepo.save(prestamo.libro);
    }

    return actualizado;
  }

  // Eliminar
  async remove(id: number) {
    const prestamo = await this.findOne(id);
    await this.prestamosRepo.remove(prestamo);
    return { ok: true };
  }
}
