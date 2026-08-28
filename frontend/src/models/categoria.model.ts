import { z } from 'zod';

/**
 * Tabela: Categorias
 * ID_Categoria (PK) | Nome (Unique) | Descricao
 */
export interface ICategoria {
  id?: string;
  nome: string;
  descricao: string;
}

export const categoriaSchema = z.object({
  id: z.string().optional(),
  nome: z
    .string()
    .min(1, 'O nome da categoria é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres'),
});
