/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

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
}
