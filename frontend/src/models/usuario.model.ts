import { z } from 'zod';
import { PAPEIS, type Papel } from './auth.model';

/**
 * Usuário tal como a API NestJS devolve.
 *
 * A senha nunca volta do servidor: ela só existe no sentido cliente → API, no
 * cadastro e na troca de senha. No banco fica apenas o hash bcrypt.
 */
export interface IUsuario {
  id?: string;
  nomeCompleto: string;
  email: string;
  /** Texto puro, enviado só ao criar ou alterar; a API converte em hash. */
  senha?: string;
  dataCadastro?: string;
  papel: Papel;
}

export { PAPEIS };
export type { Papel };

/** Cadastro: a senha é obrigatória. */
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
  senha: z
    .string()
    .min(1, 'A senha é obrigatória')
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

/** Edição: a senha é opcional — em branco, mantém a atual. */
export const usuarioEdicaoSchema = usuarioSchema.extend({
  senha: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .optional()
    .or(z.literal('')),
});
