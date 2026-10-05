import { CHAVE_TOKEN, CHAVE_USUARIO } from './sessao';
import type {
  DadosCadastro,
  DadosLogin,
  IRespostaLogin,
  ISessao,
  IUsuarioAutenticado,
} from '../models';

/**
 * Mesma API que o resto do site consome: o login é apenas o ponto onde o token
 * é obtido. As demais requisições passam pelo `http.service`, que o reenvia no
 * cabeçalho Authorization.
 */
export const AUTH_API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';



/** Erro de autenticação cuja mensagem já está pronta para a interface. */
export class ErroAutenticacao extends Error {}

/** Converte texto em JSON sem lançar: respostas de erro podem vir em HTML. */
function lerJson(texto: string): unknown {
  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    return {};
  }
}

/** Traduz a resposta de erro do NestJS em uma mensagem para o usuário. */
function mensagemDoErro(status: number, corpo: unknown): string {
  if (status === 401) return 'E-mail ou senha incorretos.';
  if (status === 409) return 'Este e-mail já está cadastrado.';

  // O ValidationPipe devolve `message` como um array de mensagens por campo;
  // as exceções do NestJS devolvem uma string.
  const { message } = (corpo ?? {}) as { message?: string | string[] };
  if (Array.isArray(message) && message.length) return message.join('. ');
  if (typeof message === 'string' && message) return message;

  return `Erro inesperado na autenticação (HTTP ${status}).`;
}

/** POST com corpo JSON na API de autenticação. */
async function postar<T>(endpoint: string, corpo: unknown): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${AUTH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    // O fetch só rejeita quando a requisição não chega ao servidor.
    console.error(`Falha ao contatar a API de autenticação (${AUTH_API_URL}):`, erro);
    throw new ErroAutenticacao(
      `Não foi possível contatar a API de autenticação em ${AUTH_API_URL}. ` +
        'Verifique se o backend NestJS está rodando (cd backend && npm run start:dev).',
    );
  }

  const conteudo = lerJson(await resposta.text());

  if (!resposta.ok) {
    throw new ErroAutenticacao(mensagemDoErro(resposta.status, conteudo));
  }

  return conteudo as T;
}

/** Lê o campo `exp` do payload do JWT e devolve o vencimento em milissegundos. */
function expiracaoDoToken(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    // O payload vem em base64url; `atob` espera base64 comum.
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number };

    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Confere o vencimento do token no próprio navegador, para não manter uma
 * sessão que a API já recusaria. O backend assina com validade de 1 hora.
 */
export function tokenValido(token: string): boolean {
  const expiracao = expiracaoDoToken(token);

  // Sem um `exp` legível, quem decide de fato é a API.
  return expiracao === null || expiracao > Date.now();
}

class AuthService {

  /** `POST /auth/login`: valida as credenciais e guarda o token devolvido. */
  async entrar(dados: DadosLogin): Promise<ISessao> {
    const resposta = await postar<IRespostaLogin>('/auth/login', dados);

    const sessao: ISessao = {
      token: resposta.access_token,
      usuario: resposta.usuario,
    };

    this.salvar(sessao);
    return sessao;
  }

  /**
   * `POST /usuarios` (rota pública) seguido de login automático: o endpoint de
   * cadastro devolve o usuário criado, mas não um token.
   */
  async cadastrar({ nomeCompleto, email, senha }: DadosCadastro): Promise<ISessao> {
    await postar<IUsuarioAutenticado>('/usuarios', {
      nomeCompleto,
      email,
      senha,
    });

    return this.entrar({ email, senha });
  }

  /** Sessão salva, ou `null` se não houver ou o token já tiver vencido. */
  obterSessao(): ISessao | null {
    const token = localStorage.getItem(CHAVE_TOKEN);
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);
    if (!token || !usuarioSalvo) return null;

    if (!tokenValido(token)) {
      this.sair();
      return null;
    }

    try {
      return {
        token,
        usuario: JSON.parse(usuarioSalvo) as IUsuarioAutenticado,
      };
    } catch {
      this.sair();
      return null;
    }
  }

  obterToken(): string | null {
    return this.obterSessao()?.token ?? null;
  }

  /** Cabeçalho `Authorization` das rotas protegidas da API NestJS. */
  cabecalhoAutorizacao(): Record<string, string> {
    const token = this.obterToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  sair(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
  }

  private salvar(sessao: ISessao): void {
    localStorage.setItem(CHAVE_TOKEN, sessao.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(sessao.usuario));
  }
}

export const authService = new AuthService();
