import { z } from 'zod';

/**
 * Tabela: Matriculas
 * ID_Matricula (PK) | ID_Usuario (FK) | ID_Curso (FK) | DataMatricula | DataConclusao (Nulável)
 */
export interface IMatricula {
  id?: string;
  idUsuario: string;
  idCurso: string;
  dataMatricula: string;
  dataConclusao: string | null;
}

export const matriculaSchema = z.object({
  id: z.string().optional(),
  idUsuario: z.string().min(1, 'Selecione o aluno'),
  idCurso: z.string().min(1, 'Selecione o curso'),
  dataMatricula: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de matrícula inválida'),
  dataConclusao: z
    .string()
    .nullable()
    .refine(
      (valor) => valor === null || valor === '' || !isNaN(Date.parse(valor)),
      'Data de conclusão inválida',
    ),
});
