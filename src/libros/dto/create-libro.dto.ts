/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class CreateLibroDto {
  @IsString()
  @MinLength(1)
  titulo: string;

  @IsString()
  @MinLength(1)
  autor: string;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  // 👇 Campo nuevo para diferenciar tipo de libro
  @IsString()
  @IsIn(['publica', 'tienda'], {
    message: 'El tipo debe ser "publica" o "tienda"',
  })
  tipo: 'publica' | 'tienda';
}
