import { z } from 'zod';

/**
 * Tabela: Trilhas
 * ID_Trilha (PK) | Titulo | Descricao | ID_Categoria (FK)
 */
export interface ITrilha {
  id?: string;
  titulo: string;
  descricao: string;
  idCategoria: string;
}

export const trilhaSchema = z.object({
  id: z.string().optional(),
  titulo: z
    .string()
    .min(1, 'O título da trilha é obrigatório')
    .min(3, 'O título deve ter no mínimo 3 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  idCategoria: z.string().min(1, 'Selecione uma categoria'),
});

/**
 * Tabela associativa: Trilhas_Cursos
 * ID_Trilha (PK, FK) | ID_Curso (PK, FK) | Ordem
 */
export interface ITrilhaCurso {
  id?: string;
  idTrilha: string;
  idCurso: string;
  ordem: number;
}

export const trilhaCursoSchema = z.object({
  id: z.string().optional(),
  idTrilha: z.string().min(1, 'Selecione a trilha'),
  idCurso: z.string().min(1, 'Selecione o curso'),
  ordem: z.coerce.number().min(1, 'A ordem deve ser maior ou igual a 1'),
});
