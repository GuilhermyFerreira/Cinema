import { z } from 'zod';

/**
 * Converte os erros de um ZodError em um mapa campo -> mensagem, no formato
 * consumido pelos componentes de formulário.
 */
export function extrairErros(erro: unknown): Record<string, string> {
  if (!(erro instanceof z.ZodError)) return {};

  const mapa: Record<string, string> = {};
  erro.issues.forEach((issue) => {
    const campo = issue.path[0];
    if (campo !== undefined) {
      mapa[campo.toString()] = issue.message;
    }
  });
  return mapa;
}
