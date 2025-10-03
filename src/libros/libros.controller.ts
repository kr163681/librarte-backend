import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { ListLibrosQuery } from './dto/list-libros.query';

// 👇 importa Swagger
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

// 👇 importa los DTOs para stock
import { RestockLibroDto } from './dto/restock-libro.dto';
import { AjustarStockDto } from './dto/ajustar-stock.dto';

@ApiTags('libros')
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @ApiOperation({ summary: 'Crear libro (pública o tienda)' })
  @Post()
  create(@Body() dto: CreateLibroDto) {
    return this.librosService.create(dto);
  }

  @ApiOperation({ summary: 'Listar libros con paginación, filtro y búsqueda' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'tipo', required: false, enum: ['publica', 'tienda'] })
  @ApiQuery({ name: 'search', required: false, example: 'sapiens' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['id', 'titulo', 'autor'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() query: ListLibrosQuery) {
    return this.librosService.findAllPaginated(query);
  }

  @ApiOperation({ summary: 'Obtener un libro por ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar libro' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLibroDto) {
    return this.librosService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar libro' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }

  // ---------- NUEVOS ENDPOINTS DE STOCK ----------

  @ApiOperation({ summary: 'Reponer stock (sumar) - Solo libros de tienda' })
  @ApiBody({ type: RestockLibroDto })
  @Post(':id/reponer')
  restock(@Param('id', ParseIntPipe) id: number, @Body() dto: RestockLibroDto) {
    return this.librosService.restock(id, dto.cantidad);
  }

  @ApiOperation({
    summary: 'Ajustar stock (valor exacto) - Solo libros de tienda',
  })
  @ApiBody({ type: AjustarStockDto })
  @Patch(':id/ajustar-stock')
  ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AjustarStockDto,
  ) {
    return this.librosService.ajustarStock(id, dto.stock);
  }
}
