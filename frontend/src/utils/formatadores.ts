/** Formata uma data ISO para o padrão brasileiro (dd/mm/aaaa). */
export function formatarData(valor?: string | null): string {
  if (!valor) return '—';
  const data = new Date(valor);
  if (isNaN(data.getTime())) return '—';
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/** Formata um número como moeda brasileira (R$ 0,00). */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Converte minutos em uma duração legível (ex.: 1h 30min). */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos}min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas}h ${resto}min` : `${horas}h`;
}

/** Recorta a data de um valor ISO para preencher inputs do tipo date. */
export function paraInputData(valor?: string | null): string {
  if (!valor) return '';
  return valor.split('T')[0];
}

/** Data de hoje no formato aceito por inputs do tipo date. */
export function hojeInputData(): string {
  return new Date().toISOString().split('T')[0];
}

/** Soma meses a uma data, usado para calcular a DataFim de uma assinatura. */
export function somarMeses(dataBase: string, meses: number): string {
  const data = new Date(dataBase);
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().split('T')[0];
}
