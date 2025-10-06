/* eslint-disable @typescript-eslint/no-unsafe-member-access */
//* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  ILike, // 👈 para búsqueda case-insensitive
} from 'typeorm';
import { Libro } from './libro.entity';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { ListLibrosQuery } from './dto/list-libros.query'; // 👈 DTO de query
import { Categoria } from '../categorias/categorias.entity';

@Injectable()
export class LibrosService {
  constructor(
    @InjectRepository(Libro)
    private readonly repo: Repository<Libro>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateLibroDto) {
    // Si no mandan tipo, asumimos "publica".
    const esTienda = ((dto as any).tipo ?? 'publica') === 'tienda';

    const data: DeepPartial<Libro> = {
      titulo: dto.titulo,
      autor: dto.autor,
      disponible: dto.disponible ?? true,
      tipo: (dto as any).tipo ?? 'publica',
      stock: esTienda ? ((dto as any).stock ?? 0) : null,
      precio: esTienda ? ((dto as any).precio ?? '0') : null,
    };

    // 👇 asignar categoría si viene categoriaId
    if (
      (dto as any).categoriaId !== undefined &&
      (dto as any).categoriaId !== null
    ) {
      const categoria = await this.categoriaRepo.findOne({
        where: { id: Number((dto as any).categoriaId) },
      });
      if (!categoria) throw new NotFoundException('Categoría no encontrada');
      (data as any).categoria = categoria;
    }

    const libro = this.repo.create(data);
    return this.repo.save(libro);
  }

  // ✅ Paginación + filtro por tipo + búsqueda + orden (ahora incluye relación categoria)
  async findAllPaginated(q: ListLibrosQuery) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 10, 100);
    const sortBy = q.sortBy ?? 'id';
    const order = (q.order ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    const where: FindOptionsWhere<Libro>[] = [];
    const base: FindOptionsWhere<Libro> = {};

    if (q.tipo) (base as any).tipo = q.tipo as any;

    if (q.search && q.search.trim() !== '') {
      const pattern = `%${q.search.trim()}%`;
      where.push({ ...base, titulo: ILike(pattern) });
      where.push({ ...base, autor: ILike(pattern) });
    } else {
      where.push(base);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: order },
      relations: { categoria: true }, // 👈 importante para devolver la categoria
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.max(1, Math.ceil(total / limit)),
        hasNext: page * limit < total,
      },
    };
  }

  async findOne(id: number) {
    const libro = await this.repo.findOne({
      where: { id },
      relations: { categoria: true }, // 👈 trae la categoría
    });
    if (!libro) throw new NotFoundException('Libro no encontrado');
    return libro;
  }

  async update(id: number, dto: UpdateLibroDto) {
    const libro = await this.findOne(id);

    // Actualizamos campos existentes
    if (dto.titulo !== undefined) libro.titulo = dto.titulo;
    if (dto.autor !== undefined) libro.autor = dto.autor;
    if (dto.disponible !== undefined) libro.disponible = dto.disponible;

    // Manejo de tipo/stock/precio coherente
    const anyDto = dto as any;

    if (anyDto.tipo !== undefined) {
      libro.tipo = anyDto.tipo;
      if (anyDto.tipo === 'tienda') {
        if (libro.stock == null) libro.stock = 0;
        if (libro.precio == null) (libro as any).precio = '0';
      }
      if (anyDto.tipo === 'publica') {
        libro.stock = null;
        (libro as any).precio = null;
      }
    }

    if (anyDto.stock !== undefined) {
      // permitido solo para tienda; si no, lo dejamos en null
      if ((anyDto.tipo ?? libro.tipo) === 'tienda') {
        libro.stock = anyDto.stock;
      } else {
        libro.stock = null;
      }
    }

    if (anyDto.precio !== undefined) {
      // permitido solo para tienda; si no, lo dejamos en null
      if ((anyDto.tipo ?? libro.tipo) === 'tienda') {
        (libro as any).precio = anyDto.precio;
      } else {
        (libro as any).precio = null;
      }
    }

    // 👇 Manejo de categoría
    if ('categoriaId' in anyDto) {
      // Si viene null => quitar categoría
      if (anyDto.categoriaId === null) {
        (libro as any).categoria = null;
      } else if (anyDto.categoriaId === undefined) {
        // no-op
      } else {
        const categoria = await this.categoriaRepo.findOne({
          where: { id: Number(anyDto.categoriaId) },
        });
        if (!categoria) throw new NotFoundException('Categoría no encontrada');
        (libro as any).categoria = categoria;
      }
    }

    return this.repo.save(libro);
  }

  async remove(id: number) {
    const libro = await this.findOne(id);
    await this.repo.remove(libro);
    return { ok: true };
  }

  async restock(id: number, cantidad: number) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser un entero > 0');
    }

    return this.repo.manager.transaction(async (em) => {
      // Para concurrencia fuerte, puedes activar lock pesimista:
      // const libro = await em.findOne(Libro, { where: { id }, lock: { mode: 'pessimistic_write' } });
      const libro = await em.findOne(Libro, {
        where: { id },
        relations: { categoria: true },
      });
      if (!libro) throw new NotFoundException('Libro no encontrado');
      if (libro.tipo !== 'tienda') {
        throw new BadRequestException(
          'Solo se reponen libros de tipo "tienda"',
        );
      }
      if (libro.stock == null) {
        throw new BadRequestException('El libro no tiene stock configurado');
      }

      libro.stock = libro.stock + cantidad;
      await em.save(Libro, libro);

      return { ok: true, id: libro.id, stockActual: libro.stock };
    });
  }

  /**
   * Ajustar stock a un valor exacto (inventario) para libros de TIENDA.
   */
  async ajustarStock(id: number, stock: number) {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new BadRequestException('El stock debe ser un entero >= 0');
    }

    return this.repo.manager.transaction(async (em) => {
      // const libro = await em.findOne(Libro, { where: { id }, lock: { mode: 'pessimistic_write' } });
      const libro = await em.findOne(Libro, {
        where: { id },
        relations: { categoria: true },
      });
      if (!libro) throw new NotFoundException('Libro no encontrado');
      if (libro.tipo !== 'tienda') {
        throw new BadRequestException(
          'Solo se ajusta stock en libros de tipo "tienda"',
        );
      }

      libro.stock = stock;
      await em.save(Libro, libro);

      return { ok: true, id: libro.id, stockActual: libro.stock };
    });
  }
}
