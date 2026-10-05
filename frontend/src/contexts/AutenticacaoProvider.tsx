import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services';
import type { DadosCadastro, DadosLogin, ISessao } from '../models';
import { AutenticacaoContext } from './autenticacao.context';

interface Props {
  children: ReactNode;
}

/**
 * Guarda a sessão do usuário em memória, partindo da que está salva no
 * localStorage. A leitura é síncrona (e descarta o token já vencido), por isso
 * acontece na inicialização do estado, sem efeito nem estado de carregamento.
 */
export function AutenticacaoProvider({ children }: Props) {
  const [sessao, setSessao] = useState<ISessao | null>(() =>
    authService.obterSessao(),
  );

  const entrar = useCallback(async (dados: DadosLogin) => {
    setSessao(await authService.entrar(dados));
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro) => {
    setSessao(await authService.cadastrar(dados));
  }, []);

  const sair = useCallback(() => {
    authService.sair();
    setSessao(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario: sessao?.usuario ?? null,
      autenticado: sessao !== null,
      ehAdmin: sessao?.usuario.papel === 'Admin',
      // Com uma API só, o usuário autenticado é o próprio usuário do sistema.
      idLocal: sessao ? String(sessao.usuario.idUsuario) : null,
      entrar,
      cadastrar,
      sair,
    }),
    [sessao, entrar, cadastrar, sair],
  );

  return (
    <AutenticacaoContext.Provider value={valor}>
      {children}
    </AutenticacaoContext.Provider>
  );
}
