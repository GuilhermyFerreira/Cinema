const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type Filtro = Record<string, string | number | undefined | null>;

/** Monta uma query string no formato aceito pelo JSON Server (?campo=valor). */
function montarQuery(filtro?: Filtro): string {
  if (!filtro) return '';

  const parametros = Object.entries(filtro)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([chave, valor]) => `${chave}=${encodeURIComponent(String(valor))}`);

  return parametros.length ? `?${parametros.join('&')}` : '';
}

/** Requisição genérica com tratamento de erro e resposta vazia. */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };

  try {
    const resposta = await fetch(url, config);

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => resposta.statusText);
      throw new Error(`Erro na API (${resposta.status}): ${detalhe}`);
    }

    if (resposta.status === 204) {
      return {} as T;
    }

    const texto = await resposta.text();
    return (texto ? JSON.parse(texto) : {}) as T;
  } catch (erro) {
    console.error(`Falha na requisição para ${url}:`, erro);
    throw erro;
  }
}

/**
 * Serviço CRUD reutilizável para qualquer coleção do JSON Server.
 * Cada entidade do modelo de dados instancia esta classe informando o recurso.
 */
export class CrudService<T extends { id?: string }> {
  protected readonly recurso: string;

  constructor(recurso: string) {
    this.recurso = recurso;
  }

  listar(filtro?: Filtro): Promise<T[]> {
    return request<T[]>(`/${this.recurso}${montarQuery(filtro)}`);
  }

  obter(id: string): Promise<T> {
    this.validarId(id);
    return request<T>(`/${this.recurso}/${id}`);
  }

  criar(dados: Omit<T, 'id'>): Promise<T> {
    return request<T>(`/${this.recurso}`, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  atualizar(id: string, dados: Partial<T>): Promise<T> {
    this.validarId(id);
    const { id: idIgnorado, ...conteudo } = dados as { id?: string };
    void idIgnorado;
    return request<T>(`/${this.recurso}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(conteudo),
    });
  }

  async excluir(id: string): Promise<void> {
    this.validarId(id);
    await request<void>(`/${this.recurso}/${id}`, { method: 'DELETE' });
  }

  protected validarId(id: string): void {
    if (!id) {
      throw new Error(`O ID do recurso "${this.recurso}" é obrigatório.`);
    }
  }
}
