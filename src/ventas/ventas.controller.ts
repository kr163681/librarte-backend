import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVentaDto } from './dto/create-venta.dto';
import { ListVentasQuery } from './dto/list-ventas.query';
import { VentasService } from './ventas.service';

@ApiTags('ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  @ApiOperation({ summary: 'Crear venta (solo libros tipo "tienda")' })
  @Post()
  create(@Body() dto: CreateVentaDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Listar ventas con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'titulo', required: false, example: 'Sapiens' })
  @ApiQuery({ name: 'from', required: false, example: '2025-10-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-10-31' })
  @Get()
  findAll(@Query() q: ListVentasQuery) {
    return this.service.findAllPaginated(q);
  }

  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
