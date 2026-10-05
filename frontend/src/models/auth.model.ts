import { z } from 'zod';

/**
 * Usuário autenticado pela API NestJS.
 *
 * O formato vem de `POST /auth/login` e é diferente de `IUsuario` (a coleção do
 * JSON Server): o backend identifica o usuário por um ID numérico e nunca
 * devolve o hash da senha.
 */
export const PAPEIS = ['Admin', 'Aluno'] as const;
export type Papel = (typeof PAPEIS)[number];

export interface IUsuarioAutenticado {
  idUsuario: number;
  nomeCompleto: string;
  email: string;
  /** Admin administra o catálogo; Aluno se matricula e assina planos. */
  papel: Papel;
}

/** Corpo devolvido por `POST /auth/login`. */
export interface IRespostaLogin {
  access_token: string;
  usuario: IUsuarioAutenticado;
}

/** Sessão guardada no navegador: o token JWT e o usuário que ele representa. */
export interface ISessao {
  token: string;
  usuario: IUsuarioAutenticado;
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
});

export type DadosLogin = z.infer<typeof loginSchema>;

/**
 * Autocadastro público. Espelha o `CreateUsuarioDto` do backend (nome, e-mail e
 * senha em texto puro, que a API converte em hash com bcrypt), somando a
 * confirmação de senha — conferida apenas na interface.
 */
export const cadastroSchema = z
  .object({
    nomeCompleto: z
      .string()
      .min(1, 'O nome completo é obrigatório')
      .min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z
      .string()
      .min(1, 'O e-mail é obrigatório')
      .email('Digite um e-mail válido'),
    senha: z
      .string()
      .min(1, 'A senha é obrigatória')
      .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmacaoSenha: z.string().min(1, 'Confirme a senha'),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: 'As senhas não conferem',
    path: ['confirmacaoSenha'],
  });

export type DadosCadastro = z.infer<typeof cadastroSchema>;
