import { z } from 'zod';

/**
 * Tabela: Usuarios
 * ID_Usuario (PK) | NomeCompleto | Email (Unique) | SenhaHash | DataCadastro
 */
export interface IUsuario {
  id?: string;
  nomeCompleto: string;
  email: string;
  senhaHash: string;
  dataCadastro: string;
  /** Papel usado apenas na interface para separar alunos de instrutores. */
  perfil: PerfilUsuario;
}

export const PERFIS = ['Aluno', 'Instrutor'] as const;
export type PerfilUsuario = (typeof PERFIS)[number];

export const usuarioSchema = z.object({
  id: z.string().optional(),
  nomeCompleto: z
    .string()
    .min(1, 'O nome completo é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido'),
  senhaHash: z
    .string()
    .min(1, 'A senha é obrigatória')
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
  dataCadastro: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de cadastro inválida'),
  perfil: z.enum(PERFIS),
});
