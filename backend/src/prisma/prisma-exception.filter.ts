import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  NotFoundException,
  type ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client';

/** Percorre um caminho de chaves em um objeto desconhecido, sem usar `any`. */
function navegar(origem: unknown, ...caminho: string[]): unknown {
  let atual = origem;
  for (const chave of caminho) {
    if (typeof atual !== 'object' || atual === null) return undefined;
    atual = (atual as Record<string, unknown>)[chave];
  }
  return atual;
}

/**
 * Traduz os erros conhecidos do Prisma em respostas HTTP adequadas.
 * Sem este filtro, violar uma chave estrangeira ou um campo único devolveria
 * 500 — e quase todas as entidades do modelo têm chaves estrangeiras.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  /**
   * Descobre quais campos violaram a restrição única. O Prisma clássico expõe
   * `meta.target`; com o driver adapter do PostgreSQL a informação vem
   * aninhada e com os nomes entre aspas.
   */
  private camposDuplicados(
    excecao: Prisma.PrismaClientKnownRequestError,
  ): string {
    const alvo: unknown = navegar(excecao.meta, 'target');
    if (Array.isArray(alvo)) return alvo.join(', ');
    if (typeof alvo === 'string') return alvo;

    const doAdapter: unknown = navegar(
      excecao.meta,
      'driverAdapterError',
      'cause',
      'constraint',
      'fields',
    );
    if (Array.isArray(doAdapter)) {
      return doAdapter
        .map((campo) => String(campo).replace(/"/g, ''))
        .join(', ');
    }

    return '';
  }

  catch(excecao: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (excecao.code) {
      // Violação de restrição única (ex.: e-mail ou nome de categoria repetido)
      case 'P2002': {
        const campos = this.camposDuplicados(excecao);
        return super.catch(
          new ConflictException(
            campos
              ? `Já existe um registro com este valor em: ${campos}`
              : 'Já existe um registro com este valor',
          ),
          host,
        );
      }

      // Chave estrangeira inválida (ex.: idCurso que não existe)
      case 'P2003':
        return super.catch(
          new BadRequestException(
            'Referência inválida: o registro relacionado informado não existe',
          ),
          host,
        );

      // Registro não encontrado em update/delete
      case 'P2025':
        return super.catch(
          new NotFoundException('Registro não encontrado'),
          host,
        );

      default:
        return super.catch(excecao, host);
    }
  }
}
