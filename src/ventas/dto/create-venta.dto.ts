import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateVentaDto {
  @ApiProperty({
    example: 7,
    description: 'ID del libro (debe ser tipo "tienda")',
  })
  @IsInt()
  @Min(1)
  libroId: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad a vender',
  })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({
    example: 49900,
    description: 'Precio unitario en pesos (COP) u otra moneda',
  })
  @IsNumber()
  @Min(0)
  precioUnitario: number;
}
