import { createContext } from 'react';
import type { DadosCadastro, DadosLogin, IUsuarioAutenticado } from '../models';

export interface ContextoAutenticacao {
  usuario: IUsuarioAutenticado | null;
  autenticado: boolean;
  /** Administra o catálogo (cursos, módulos, aulas, trilhas, planos). */
  ehAdmin: boolean;
  /** ID do usuário correspondente no JSON Server, usado para filtrar "o meu". */
  idLocal: string | null;
  entrar: (dados: DadosLogin) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  sair: () => void;
}

/**
 * Criado em arquivo próprio: o provider é um componente, e manter os dois
 * separados evita o aviso do react-refresh sobre exports mistos.
 */
export const AutenticacaoContext = createContext<ContextoAutenticacao | null>(
  null,
);
