import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../../users/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['tienda-admin', 'escuela-admin', 'usuario-tienda', 'usuario-escuela'])
  role: RolUsuario;
}
