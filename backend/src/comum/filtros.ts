/**
 * Monta o `where` do Prisma a partir dos parâmetros de consulta.
 *
 * Só os campos explicitamente permitidos por cada recurso entram, para que a
 * query string não vire uma porta de entrada para filtrar por qualquer coluna.
 * Os valores chegam sempre como texto na URL, então os numéricos são
 * convertidos aqui.
 */
export function montarWhere(
  filtro: Record<string, unknown>,
  numericos: readonly string[],
  textuais: readonly string[] = [],
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  for (const campo of numericos) {
    const valor = filtro[campo];
    if (valor === undefined || valor === null || valor === '') continue;

    const numero = Number(valor);
    if (!Number.isNaN(numero)) where[campo] = numero;
  }

  for (const campo of textuais) {
    const valor = filtro[campo];
    if (typeof valor === 'string' && valor !== '') where[campo] = valor;
  }

  return where;
}
