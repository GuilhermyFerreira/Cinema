import { z } from 'zod';

/**
 * Tabela: Avaliacoes
 * ID_Avaliacao (PK) | ID_Usuario (FK) | ID_Curso (FK) | Nota (1 a 5)
 * Comentario (Nulável) | DataAvaliacao
 */
export interface IAvaliacao {
  id?: string;
  idUsuario: string;
  idCurso: string;
  nota: number;
  comentario: string | null;
  dataAvaliacao: string;
}

export const avaliacaoSchema = z.object({
  id: z.string().optional(),
  idUsuario: z.string().min(1, 'Selecione o aluno'),
  idCurso: z.string().min(1, 'Selecione o curso'),
  nota: z.coerce
    .number()
    .min(1, 'A nota mínima é 1')
    .max(5, 'A nota máxima é 5'),
  comentario: z.string().nullable(),
  dataAvaliacao: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data da avaliação inválida'),
});
