// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Registrar usuario con email' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    // El servicio espera 1 argumento (dto), no 3
    return this.auth.register(dto);
  }

  @ApiOperation({ summary: 'Iniciar sesión y obtener JWT' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    // El servicio espera 1 argumento (dto), no 2
    return this.auth.login(dto);
  }
}
