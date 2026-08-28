import { z } from 'zod';

/**
 * Tabela: Modulos
 * ID_Modulo (PK) | ID_Curso (FK) | Titulo | Ordem
 */
export interface IModulo {
  id?: string;
  idCurso: string;
  titulo: string;
  ordem: number;
}

export const moduloSchema = z.object({
  id: z.string().optional(),
  idCurso: z.string().min(1, 'O módulo precisa pertencer a um curso'),
  titulo: z
    .string()
    .min(1, 'O título do módulo é obrigatório')
    .min(3, 'O título deve ter no mínimo 3 caracteres'),
  ordem: z.coerce.number().min(1, 'A ordem deve ser maior ou igual a 1'),
});
