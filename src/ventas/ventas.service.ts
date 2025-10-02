/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Venta } from './venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { ListVentasQuery } from './dto/list-ventas.query';
import { Libro } from '../libros/libro.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    @InjectRepository(Libro) private readonly librosRepo: Repository<Libro>,
  ) {}

  /**
   * Crea una venta con transacción:
   * - Verifica que el libro sea tipo "tienda"
   * - Verifica stock >= cantidad
   * - Descuenta stock
   * - Crea la venta
   */
  async create(dto: CreateVentaDto) {
    const { libroId, cantidad, precioUnitario } = dto;

    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
      throw new BadRequestException('precioUnitario inválido');
    }

    return this.ventasRepo.manager.transaction(async (em) => {
      const libro = await em.findOne(Libro, { where: { id: libroId } });
      if (!libro) throw new NotFoundException('Libro no encontrado');
      if (libro.tipo !== 'tienda') {
        throw new BadRequestException(
          'Solo se pueden vender libros de tipo "tienda"',
        );
      }
      if (libro.stock == null) {
        throw new BadRequestException('Libro sin stock configurado');
      }
      if (libro.stock < cantidad) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${libro.stock}`,
        );
      }

      // Descontar stock
      libro.stock = libro.stock - cantidad;
      await em.save(Libro, libro);

      // Calcular total (usa string para precisión en SQL numeric)
      const total = (precioUnitario * cantidad).toFixed(2);

      const venta = em.create(Venta, {
        libro,
        cantidad,
        precioUnitario: precioUnitario.toFixed(2), // como string
        total,
      });
      return em.save(Venta, venta);
    });
  }

  /**
   * Listado con paginación y filtros (fecha y título)
   */
  async findAllPaginated(q: ListVentasQuery) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 10, 100);

    const where: FindOptionsWhere<Venta> = {};

    // Filtro por rango de fechas (fecha de creación)
    if (q.from && q.to) {
      // Entre 00:00 y 23:59 del rango dado
      const from = new Date(q.from + 'T00:00:00.000Z');
      const to = new Date(q.to + 'T23:59:59.999Z');
      where.fecha = Between(from, to);
    } else if (q.from) {
      const from = new Date(q.from + 'T00:00:00.000Z');
      where.fecha = Between(from, from);
    } else if (q.to) {
      const to = new Date(q.to + 'T23:59:59.999Z');
      where.fecha = Between(to, to);
    }

    // findAndCount no permite where anidado con relación directamente,
    // así que hacemos filtro por título con join en query builder si se envía 'titulo'
    if (q.titulo && q.titulo.trim() !== '') {
      const qb = this.ventasRepo
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.libro', 'libro')
        .where(where.fecha ? 'venta.fecha BETWEEN :from AND :to' : '1=1', {
          from: (where as any).fecha?.low,
          to: (where as any).fecha?.high,
        })
        .andWhere('libro.titulo ILIKE :titulo', {
          titulo: `%${q.titulo.trim()}%`,
        })
        .orderBy('venta.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await qb.getManyAndCount();
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

    // Sin filtro por título, podemos usar findAndCount con relación eager del libro
    const [data, total] = await this.ventasRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
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
    const venta = await this.ventasRepo.findOne({ where: { id } });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }

  // Nota: por lo general no se permite editar/eliminar una venta pasada,
  // pero si lo quieres, podemos implementar PATCH/DELETE con cuidado de stock.
}
