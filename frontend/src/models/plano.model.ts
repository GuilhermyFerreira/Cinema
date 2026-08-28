import { z } from 'zod';

/**
 * Tabela: Planos
 * ID_Plano (PK) | Nome (not null) | Descricao | Preco (not null) | DuracaoMeses (not null)
 */
export interface IPlano {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMeses: number;
}

export const planoSchema = z.object({
  id: z.string().optional(),
  nome: z
    .string()
    .min(1, 'O nome do plano é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  preco: z.coerce.number().min(0, 'O preço não pode ser negativo'),
  duracaoMeses: z.coerce
    .number()
    .min(1, 'A duração mínima é de 1 mês'),
});
