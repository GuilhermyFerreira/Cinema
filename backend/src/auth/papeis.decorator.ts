import { SetMetadata } from '@nestjs/common';
import type { Papel } from '../generated/prisma/enums';

export const CHAVE_PAPEIS = 'papeis';

/**
 * Restringe uma rota (ou um controller inteiro) aos papéis informados.
 * Sem este decorator, basta estar autenticado.
 *
 * Use sempre junto do `AuthGuard('jwt')`: é ele que preenche `request.user`,
 * de onde o PapeisGuard lê o papel.
 */
export const Papeis = (...papeis: Papel[]) => SetMetadata(CHAVE_PAPEIS, papeis);
