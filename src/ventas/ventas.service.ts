/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository, DataSource } from 'typeorm';
import { Venta } from './venta.entity';
import { VentaItem } from './venta-item.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { ListVentasQuery } from './dto/list-ventas.query';
import { Libro } from '../libros/libro.entity';

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    @InjectRepository(VentaItem)
    private readonly itemsRepo: Repository<VentaItem>,
    @InjectRepository(Libro) private readonly librosRepo: Repository<Libro>,
  ) {}

  /**
   * Crea una venta con múltiples ítems:
   * - Verifica que cada libro sea tipo "tienda"
   * - Verifica stock >= cantidad
   * - Usa precioUnitario del payload o el precio del libro
   * - Descuenta stock por ítem
   * - Crea cabecera (Venta) + detalle (VentaItem[])
   * - Todo en transacción
   */
  async create(dto: CreateVentaDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('La venta debe tener al menos un ítem');
    }

    return this.dataSource.transaction(async (em) => {
      // Cargamos todos los libros de una
      const ids = dto.items.map((i) => i.libroId);
      const libros = await em
        .getRepository(Libro)
        .find({ where: { id: In(ids) } });

      // Mapa para lookup rápido
      const byId = new Map<number, Libro>();
      for (const l of libros) byId.set(l.id, l);

      let total = 0;
      const itemsToPersist: Partial<VentaItem>[] = [];

      for (const it of dto.items) {
        const libro = byId.get(it.libroId);
        if (!libro)
          throw new NotFoundException(`Libro ${it.libroId} no encontrado`);

        if (libro.tipo !== 'tienda') {
          throw new BadRequestException(
            `El libro "${libro.titulo}" no es de tipo tienda`,
          );
        }
        if (libro.stock == null) {
          throw new BadRequestException(
            `El libro "${libro.titulo}" no maneja stock`,
          );
        }
        if (!Number.isInteger(it.cantidad) || it.cantidad <= 0) {
          throw new BadRequestException(
            `Cantidad inválida para el libro ${libro.id}`,
          );
        }
        if (libro.stock < it.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${libro.titulo}". Disponible: ${libro.stock}`,
          );
        }

        // Precio: prioriza el que venga en el payload; si no, usa libro.precio
        const precioUnitarioNum =
          it.precioUnitario ?? (libro.precio ? Number(libro.precio) : null);

        if (
          precioUnitarioNum == null ||
          !Number.isFinite(precioUnitarioNum) ||
          precioUnitarioNum <= 0
        ) {
          throw new BadRequestException(
            `Precio no disponible para "${libro.titulo}". Envía precioUnitario o define libro.precio`,
          );
        }

        // Descontar stock en memoria y luego persistimos todos
        libro.stock = libro.stock - it.cantidad;

        const subtotalNum = precioUnitarioNum * it.cantidad;
        total += subtotalNum;

        itemsToPersist.push({
          libroId: libro.id,
          cantidad: it.cantidad,
          precioUnitario: precioUnitarioNum.toFixed(2),
          subtotal: subtotalNum.toFixed(2),
        });
      }

      // Guardar nuevos stocks
      await em.getRepository(Libro).save(Array.from(byId.values()));

      // Crear cabecera de venta
      const venta = em.getRepository(Venta).create({
        total: total.toFixed(2),
      });
      await em.getRepository(Venta).save(venta);

      // Crear ítems
      const itemsEntities = itemsToPersist.map((i) =>
        em.getRepository(VentaItem).create({ ...i, ventaId: venta.id }),
      );
      await em.getRepository(VentaItem).save(itemsEntities);

      // Devolver venta completa con sus ítems y libros
      const ventaCompleta = await em.getRepository(Venta).findOne({
        where: { id: venta.id },
        relations: ['items', 'items.libro'],
      });

      return ventaCompleta!;
    });
  }

  /**
   * Listado con paginación y filtros por fecha (y opcional búsqueda simple por id numérico)
   * Devuelve también items + libro por cada venta.
   */
  async findAllPaginated(q: ListVentasQuery) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 10, 100);

    const where: any = {};

    if (q.from && q.to) {
      // Rango [from 00:00, to 23:59]
      const from = new Date(q.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(q.to);
      to.setHours(23, 59, 59, 999);
      where.fecha = Between(from, to);
    } else if (q.from) {
      const from = new Date(q.from);
      from.setHours(0, 0, 0, 0);
      where.fecha = Between(from, new Date());
    } else if (q.to) {
      const to = new Date(q.to);
      to.setHours(0, 0, 0, 0);
      where.fecha = Between(new Date(0), to);
    }

    if (q.titulo && q.titulo.trim() !== '') {
      // Filtro por título (join con items y libro)
      const qb = this.ventasRepo
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.items', 'item')
        .leftJoinAndSelect('item.libro', 'libro')
        .where(where.fecha ? 'venta.fecha BETWEEN :from AND :to' : '1=1', {
          from: (where as any).fecha?.low,
          to: where.fecha?.high,
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

    // Sin filtro por título, cargamos relaciones para ver ítems y libros
    const [data, total] = await this.ventasRepo.findAndCount({
      where,
      relations: ['items', 'items.libro'],
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
    const venta = await this.ventasRepo.findOne({
      where: { id },
      relations: ['items', 'items.libro'],
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }
}
