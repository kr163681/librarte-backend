import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
  IsInt,
  Min,
  IsNumberString,
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

  // 👇 Solo aplica si el tipo es "tienda"
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number | null;

  @IsOptional()
  @IsNumberString()
  precio?: string | null;

  // 👇 Campo nuevo para asignar una categoría existente
  @IsOptional()
  @IsInt()
  categoriaId?: number;
}
