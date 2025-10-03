import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

// Auth
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('prestamos')
@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) {}

  // ===== Crear préstamo =====
  // Solo "escuela-admin" puede crear préstamos
  @ApiOperation({ summary: 'Crear préstamo de un libro (solo escuela-admin)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('escuela-admin')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        libroId: { type: 'integer', example: 3 },
        usuario: { type: 'string', example: 'Kevin' },
        fechaPrestamo: { type: 'string', example: '2025-10-01' },
        fechaDevolucion: { type: 'string', example: '2025-10-15' },
      },
      required: ['libroId', 'usuario', 'fechaPrestamo'],
    },
  })
  @Post()
  create(@Body() dto: CreatePrestamoDto) {
    return this.service.create(dto);
  }

  // ===== Listar préstamos =====
  // Escuela-admin ve todos, usuarios-escuela solo los suyos (lo afinamos luego en service)
  @ApiOperation({ summary: 'Listar préstamos' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('escuela-admin', 'usuario-escuela')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ===== Obtener préstamo por ID =====
  @ApiOperation({ summary: 'Obtener un préstamo por ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('escuela-admin', 'usuario-escuela')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ===== Actualizar préstamo =====
  // Solo escuela-admin
  @ApiOperation({ summary: 'Actualizar préstamo (escuela-admin)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('escuela-admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrestamoDto,
  ) {
    return this.service.update(id, dto);
  }

  // ===== Eliminar préstamo =====
  // Solo escuela-admin
  @ApiOperation({ summary: 'Eliminar préstamo (escuela-admin)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('escuela-admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
