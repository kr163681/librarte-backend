/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // ❌ el token expira
      secretOrKey: process.env.JWT_SECRET || 'superSecretKey', // ⚠️ usa tu .env
    });
  }

  // 👇 ya no es async porque no usamos await
  validate(payload: { sub: number; username: string; role: string }) {
    // El objeto que retornes estará disponible en req.user
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
