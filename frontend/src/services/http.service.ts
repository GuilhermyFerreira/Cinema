import { obterTokenArmazenado } from './sessao';

/**
 * Toda a aplicação consome a API NestJS, que exige token JWT e aplica as
 * regras de papel (Admin administra o catálogo; Aluno se matricula e assina).
 *
 * Antes o site lia do JSON Server, que não tem autenticação — esconder os
 * botões de administração era apenas cosmético, porque qualquer um podia
 * chamar a API diretamente. Agora quem recusa é o servidor.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type Filtro = Record<string, string | number | undefined | null>;

/**
 * Chaves estrangeiras do modelo. Precisam virar número ao sair e texto ao
 * entrar, para que as telas sigam comparando identificadores como texto.
 *
 * `idTransacaoGateway` fica de fora de propósito: apesar do prefixo, é texto.
 */
const CAMPOS_ID = new Set([
  'idUsuario',
  'idInstrutor',
  'idCategoria',
  'idCurso',
  'idModulo',
  'idAula',
  'idMatricula',
  'idAvaliacao',
  'idTrilha',
  'idCertificado',
  'idPlano',
  'idAssinatura',
  'idPagamento',
]);

/** Monta a query string a partir dos filtros preenchidos. */
function montarQuery(filtro?: Filtro): string {
  if (!filtro) return '';

  const partes = Object.entries(filtro)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);

  return partes.length ? `?${partes.join('&')}` : '';
}

/** Requisição genérica, já assinada com o token da sessão. */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = obterTokenArmazenado();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const resposta = await fetch(url, config);

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => resposta.statusText);
      throw new Error(`Erro na API (${resposta.status}): ${detalhe}`);
    }

    if (resposta.status === 204) return {} as T;

    const texto = await resposta.text();
    return (texto ? JSON.parse(texto) : {}) as T;
  } catch (erro) {
    console.error(`Falha na requisição para ${url}:`, erro);
    throw erro;
  }
}

/** Converte os identificadores numéricos da API em texto, e expõe `id`. */
function daApi<T>(registro: Record<string, unknown>, chave: string): T {
  const saida: Record<string, unknown> = { ...registro };

  for (const [campo, valor] of Object.entries(saida)) {
    if (CAMPOS_ID.has(campo) && typeof valor === 'number') {
      saida[campo] = String(valor);
    }
  }

  saida.id = String(registro[chave]);
  return saida as T;
}

/** Prepara o corpo do envio: `id` sai fora e as chaves voltam a ser números. */
function paraApi(dados: Record<string, unknown>): Record<string, unknown> {
  const saida: Record<string, unknown> = {};

  for (const [campo, valor] of Object.entries(dados)) {
    if (campo === 'id') continue;

    if (CAMPOS_ID.has(campo)) {
      saida[campo] =
        valor === null || valor === undefined || valor === ''
          ? null
          : Number(valor);
      continue;
    }

    saida[campo] = valor;
  }

  return saida;
}

/**
 * CRUD reutilizável sobre a API NestJS.
 *
 * Cada entidade informa seu recurso e o nome da própria chave primária
 * (`idCurso`, `idCategoria`, ...), que o serviço traduz para o `id` usado
 * pelas telas.
 */
export class CrudService<T extends { id?: string }> {
  protected readonly recurso: string;
  protected readonly chave: string;

  constructor(recurso: string, chave: string) {
    this.recurso = recurso;
    this.chave = chave;
  }

  async listar(filtro?: Filtro): Promise<T[]> {
    const registros = await request<Record<string, unknown>[]>(
      `/${this.recurso}${montarQuery(filtro)}`,
    );
    return registros.map((r) => daApi<T>(r, this.chave));
  }

  async obter(id: string): Promise<T> {
    this.validarId(id);
    const registro = await request<Record<string, unknown>>(
      `/${this.recurso}/${id}`,
    );
    return daApi<T>(registro, this.chave);
  }

  async criar(dados: Omit<T, 'id'>): Promise<T> {
    const criado = await request<Record<string, unknown>>(`/${this.recurso}`, {
      method: 'POST',
      body: JSON.stringify(paraApi(dados as Record<string, unknown>)),
    });
    return daApi<T>(criado, this.chave);
  }

  async atualizar(id: string, dados: Partial<T>): Promise<T> {
    this.validarId(id);
    const atualizado = await request<Record<string, unknown>>(
      `/${this.recurso}/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(paraApi(dados as Record<string, unknown>)),
      },
    );
    return daApi<T>(atualizado, this.chave);
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

/**
 * Variante para os dois recursos de chave composta (`Progresso_Aulas` e
 * `Trilhas_Cursos`), cujas rotas recebem dois identificadores.
 *
 * As telas continuam tratando cada registro por um `id` único: aqui ele é
 * montado juntando as duas partes com `-`, e desmontado no caminho de volta.
 */
export class CrudCompostoService<T extends { id?: string }> {
  protected readonly recurso: string;
  protected readonly chaveA: string;
  protected readonly chaveB: string;

  constructor(recurso: string, chaveA: string, chaveB: string) {
    this.recurso = recurso;
    this.chaveA = chaveA;
    this.chaveB = chaveB;
  }

  private caminho(id: string): string {
    const [a, b] = id.split('-');
    return `/${this.recurso}/${a}/${b}`;
  }

  private comId(registro: Record<string, unknown>): T {
    const saida: Record<string, unknown> = { ...registro };

    for (const [campo, valor] of Object.entries(saida)) {
      if (CAMPOS_ID.has(campo) && typeof valor === 'number') {
        saida[campo] = String(valor);
      }
    }

    saida.id = `${String(registro[this.chaveA])}-${String(registro[this.chaveB])}`;
    return saida as T;
  }

  async listar(filtro?: Filtro): Promise<T[]> {
    const registros = await request<Record<string, unknown>[]>(
      `/${this.recurso}${montarQuery(filtro)}`,
    );
    return registros.map((r) => this.comId(r));
  }

  async obter(id: string): Promise<T> {
    return this.comId(
      await request<Record<string, unknown>>(this.caminho(id)),
    );
  }

  async criar(dados: Omit<T, 'id'>): Promise<T> {
    const criado = await request<Record<string, unknown>>(`/${this.recurso}`, {
      method: 'POST',
      body: JSON.stringify(paraApi(dados as Record<string, unknown>)),
    });
    return this.comId(criado);
  }

  async atualizar(id: string, dados: Partial<T>): Promise<T> {
    const atualizado = await request<Record<string, unknown>>(
      this.caminho(id),
      {
        method: 'PATCH',
        body: JSON.stringify(paraApi(dados as Record<string, unknown>)),
      },
    );
    return this.comId(atualizado);
  }

  async excluir(id: string): Promise<void> {
    await request<void>(this.caminho(id), { method: 'DELETE' });
  }
}
