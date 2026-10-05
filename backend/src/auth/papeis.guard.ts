import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Papel } from '../generated/prisma/enums';
import { CHAVE_PAPEIS } from './papeis.decorator';

interface RequisicaoComUsuario {
  user?: { userId: number; email: string; papel: Papel };
}

/**
 * Confere o papel do usuário autenticado contra o que a rota exige.
 *
 * O papel vem do próprio token, então uma mudança de papel só vale a partir do
 * próximo login — o token anterior continua válido até expirar (1 hora).
 */
@Injectable()
export class PapeisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const exigidos = this.reflector.getAllAndOverride<Papel[] | undefined>(
      CHAVE_PAPEIS,
      [contexto.getHandler(), contexto.getClass()],
    );

    // Rota sem @Papeis: basta estar autenticado.
    if (!exigidos?.length) return true;

    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoComUsuario>();
    const usuario = requisicao.user;

    if (!usuario) throw new UnauthorizedException('Token ausente ou inválido');

    if (!exigidos.includes(usuario.papel)) {
      throw new ForbiddenException(
        `Esta operação exige o papel: ${exigidos.join(' ou ')}`,
      );
    }

    return true;
  }
}
