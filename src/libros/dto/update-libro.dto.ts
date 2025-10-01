import { PartialType } from '@nestjs/mapped-types';
import { CreateLibroDto } from './create-libro.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateLibroDto extends PartialType(CreateLibroDto) {}
