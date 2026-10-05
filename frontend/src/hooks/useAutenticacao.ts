import { useContext } from 'react';
import { AutenticacaoContext } from '../contexts/autenticacao.context';

/** Acessa a sessão atual. Só funciona dentro de `<AutenticacaoProvider>`. */
export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext);

  if (!contexto) {
    throw new Error(
      'useAutenticacao precisa ser usado dentro de <AutenticacaoProvider>.',
    );
  }

  return contexto;
}
