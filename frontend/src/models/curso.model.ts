import { z } from 'zod';

/**
 * Tabela: Cursos
 * ID_Curso (PK) | Titulo | Descricao | ID_Instrutor (FK) | ID_Categoria (FK)
 * Nivel | DataPublicacao | TotalAulas | TotalHoras
 */
export const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'] as const;
export type NivelCurso = (typeof NIVEIS)[number];

export interface ICurso {
  id?: string;
  titulo: string;
  descricao: string;
  idInstrutor: string;
  idCategoria: string;
  nivel: NivelCurso;
  dataPublicacao: string;
  totalAulas: number;
  totalHoras: number;
}

export const cursoSchema = z.object({
  id: z.string().optional(),
  titulo: z
    .string()
    .min(1, 'O título é obrigatório')
    .min(3, 'O título deve ter no mínimo 3 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  idInstrutor: z.string().min(1, 'Selecione o instrutor responsável'),
  idCategoria: z.string().min(1, 'Selecione uma categoria'),
  nivel: z.enum(NIVEIS),
  dataPublicacao: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de publicação inválida'),
  totalAulas: z.coerce.number().min(0, 'O total de aulas não pode ser negativo'),
  totalHoras: z.coerce.number().min(0, 'O total de horas não pode ser negativo'),
});
