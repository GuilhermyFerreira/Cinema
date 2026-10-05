import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não definida');

    super({
      // Extrai o token do cabeçalho de autorização como Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Se o token for válido, o NestJS anexa este retorno ao objeto da requisição (req.user)
  validate({ sub, email, papel }: JwtPayload) {
    return { userId: sub, email, papel };
  }
}
