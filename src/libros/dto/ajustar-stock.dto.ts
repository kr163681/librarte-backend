import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AjustarStockDto {
  @ApiProperty({
    example: 25,
    description: 'Stock final deseado (entero >= 0)',
  })
  @IsInt()
  @Min(0)
  stock: number;
}
