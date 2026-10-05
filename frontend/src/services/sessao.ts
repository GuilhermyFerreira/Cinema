/**
 * Armazenamento da sessão no navegador.
 *
 * Fica em arquivo próprio porque tanto o `auth.service` (que grava) quanto o
 * `http.service` (que lê o token para assinar as requisições) precisam dele.
 * Se o `http.service` importasse o `auth.service`, haveria ciclo de imports.
 */
export const CHAVE_TOKEN = 'eduplus.token';
export const CHAVE_USUARIO = 'eduplus.usuario';

/** Token JWT da sessão atual, ou null se não houver. */
export function obterTokenArmazenado(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}
