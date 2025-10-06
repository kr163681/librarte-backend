import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RestockLibroDto {
  @ApiProperty({
    example: 10,
    description: 'Cantidad a sumar al stock actual (entero > 0)',
  })
  @IsInt()
  @Min(1)
  cantidad: number;
}
