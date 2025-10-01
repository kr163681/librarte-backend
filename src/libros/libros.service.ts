import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Libro } from './libro.entity';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Injectable()
export class LibrosService {
  constructor(
    @InjectRepository(Libro)
    private readonly repo: Repository<Libro>,
  ) {}

  async create(dto: CreateLibroDto) {
    const libro = this.repo.create(dto as DeepPartial<Libro>);
    return this.repo.save(libro);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const libro = await this.repo.findOne({ where: { id } });
    if (!libro) throw new NotFoundException('Libro no encontrado');
    return libro;
  }

  async update(id: number, dto: UpdateLibroDto) {
    const libro = await this.findOne(id);
    this.repo.merge(libro, dto as DeepPartial<Libro>);
    return this.repo.save(libro);
  }

  async remove(id: number) {
    const libro = await this.findOne(id);
    await this.repo.remove(libro);
    return { ok: true };
  }
}
