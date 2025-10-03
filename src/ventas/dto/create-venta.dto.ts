// src/ventas/dto/create-venta.dto.ts
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVentaItemDto {
  @IsInt()
  @IsPositive()
  libroId: number;

  @IsInt()
  @IsPositive()
  cantidad: number;

  // Si no se manda, se usará el precio definido en el Libro
  @IsOptional()
  @IsNumber()
  @IsPositive()
  precioUnitario?: number;
}

export class CreateVentaDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVentaItemDto)
  items: CreateVentaItemDto[];
}
