import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsIn(['tienda-admin', 'escuela-admin', 'usuario-tienda', 'usuario-escuela'])
  role: 'tienda-admin' | 'escuela-admin' | 'usuario-tienda' | 'usuario-escuela';
}
