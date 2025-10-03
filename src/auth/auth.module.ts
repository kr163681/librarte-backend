// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { JwtStrategy } from './jwt.strategy'; // 👈 agrega la estrategia
// (Opcional) si quieres tener RolesGuard/JwtAuthGuard como providers globales, los importas aquí
// import { RolesGuard } from './guards/roles.guard';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule, // 👈 necesario para passport-jwt
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') ?? 'dev_secret_cambia_esto',
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') ?? '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // 👈 registra la estrategia
    // RolesGuard,                                      // (opcional) si lo quieres como provider aquí
    // JwtAuthGuard,                                    // (normalmente no es necesario registrarlo aquí)
  ],
  exports: [AuthService],
})
export class AuthModule {}
