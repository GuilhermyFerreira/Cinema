import { z } from 'zod';

/**
 * Tabela: Progresso_Aulas
 * ID_Usuario (PK, FK) | ID_Aula (PK, FK) | DataConclusao | Status
 *
 * O JSON Server exige uma chave `id` simples, então a chave composta do modelo
 * relacional é representada pelo par (idUsuario, idAula), garantido como único
 * pela camada de serviço.
 */
export const STATUS_PROGRESSO = ['Em Andamento', 'Concluído'] as const;
export type StatusProgresso = (typeof STATUS_PROGRESSO)[number];

export interface IProgressoAula {
  id?: string;
  idUsuario: string;
  idAula: string;
  dataConclusao: string;
  status: StatusProgresso;
}

export const progressoAulaSchema = z.object({
  id: z.string().optional(),
  idUsuario: z.string().min(1, 'Selecione o aluno'),
  idAula: z.string().min(1, 'Selecione a aula'),
  dataConclusao: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de conclusão inválida'),
  status: z.enum(STATUS_PROGRESSO),
});
