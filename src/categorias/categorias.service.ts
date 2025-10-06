import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Categoria } from './categorias.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateCategoriaDto) {
    const exists = await this.categoriaRepo.findOne({
      where: { nombre: ILike(dto.nombre) },
    });
    if (exists) throw new ConflictException('La categoría ya existe');
    return this.categoriaRepo.save(this.categoriaRepo.create(dto));
  }

  findAll() {
    return this.categoriaRepo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const cat = await this.categoriaRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const cat = await this.findOne(id);
    if (dto.nombre && dto.nombre !== cat.nombre) {
      const dup = await this.categoriaRepo.findOne({
        where: { nombre: ILike(dto.nombre) },
      });
      if (dup)
        throw new ConflictException('Ya existe una categoría con ese nombre');
    }
    Object.assign(cat, dto);
    return this.categoriaRepo.save(cat);
  }

  async remove(id: number) {
    const cat = await this.findOne(id);
    await this.categoriaRepo.remove(cat);
  }
}
