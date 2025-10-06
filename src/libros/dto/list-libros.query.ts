import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListLibrosQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsIn(['publica', 'tienda'])
  tipo?: 'publica' | 'tienda';

  @IsOptional()
  @IsString()
  search?: string;

  // Opcionales de ordenamiento simple
  @IsOptional()
  @IsIn(['id', 'titulo', 'autor'])
  sortBy?: 'id' | 'titulo' | 'autor';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
