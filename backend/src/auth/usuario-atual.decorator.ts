import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Papel } from '../generated/prisma/enums';

/** O que a JwtStrategy anexa à requisição depois de validar o token. */
export interface UsuarioAutenticado {
  userId: number;
  email: string;
  papel: Papel;
}

/**
 * Entrega o usuário autenticado direto no parâmetro do controller, evitando
 * ler `request.user` na mão.
 */
export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const requisicao = contexto
      .switchToHttp()
      .getRequest<{ user: UsuarioAutenticado }>();
    return requisicao.user;
  },
);
