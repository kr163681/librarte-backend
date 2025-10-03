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
  UseGuards,
} from '@nestjs/common';
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { ListLibrosQuery } from './dto/list-libros.query';

// Swagger
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// Auth (JWT + Roles)
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('libros')
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  // ====== Crear libro ======
  // Solo administradores (tienda o escuela) pueden crear libros
  @ApiOperation({ summary: 'Crear libro (pública o tienda)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tienda-admin', 'escuela-admin')
  @Post()
  create(@Body() dto: CreateLibroDto) {
    return this.librosService.create(dto);
  }

  // ====== Listar (paginado, filtro, búsqueda, orden) ======
  // Público (para que el front pueda listar sin token si quieres)
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

  // ====== Obtener por ID ======
  // Público
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.findOne(id);
  }

  // ====== Actualizar libro ======
  // Admin (tienda o escuela)
  @ApiOperation({ summary: 'Actualizar libro' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tienda-admin', 'escuela-admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLibroDto) {
    return this.librosService.update(id, dto);
  }

  // ====== Eliminar libro ======
  // Admin (tienda o escuela)
  @ApiOperation({ summary: 'Eliminar libro' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tienda-admin', 'escuela-admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }

  // ====== Reponer stock (sumar cantidad) ======
  // Solo tienda-admin
  @ApiOperation({
    summary: 'Reponer stock (sumar cantidad) - Solo libros de tienda',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tienda-admin')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cantidad: { type: 'integer', example: 5, minimum: 1 },
      },
      required: ['cantidad'],
    },
  })
  @Post(':id/reponer')
  restock(
    @Param('id', ParseIntPipe) id: number,
    @Body('cantidad') cantidad: number,
  ) {
    return this.librosService.restock(id, cantidad);
  }

  // ====== Ajustar stock (valor exacto) ======
  // Solo tienda-admin
  @ApiOperation({
    summary: 'Ajustar stock a un valor exacto - Solo libros de tienda',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tienda-admin')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stock: { type: 'integer', example: 20, minimum: 0 },
      },
      required: ['stock'],
    },
  })
  @Patch(':id/ajustar-stock')
  ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('stock') stock: number,
  ) {
    return this.librosService.ajustarStock(id, stock);
  }
}
