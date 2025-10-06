/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePrestamoDto {
  @IsInt()
  libroId: number;

  @IsString()
  @MinLength(1)
  usuario: string;

  @IsDateString()
  fechaPrestamo: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  fechaDevolucion?: string;

  @IsOptional()
  @IsBoolean()
  devuelto?: boolean;
}
