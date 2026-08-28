import { z } from 'zod';

/**
 * Tabela: Certificados
 * ID_Certificado (PK) | ID_Usuario (FK) | ID_Curso (FK) | ID_Trilha (FK, Nulável)
 * CodigoVerificacao (Unique) | DataEmissao
 */
export interface ICertificado {
  id?: string;
  idUsuario: string;
  idCurso: string;
  idTrilha: string | null;
  codigoVerificacao: string;
  dataEmissao: string;
}

export const certificadoSchema = z.object({
  id: z.string().optional(),
  idUsuario: z.string().min(1, 'Selecione o aluno'),
  idCurso: z.string().min(1, 'Selecione o curso concluído'),
  idTrilha: z.string().nullable(),
  codigoVerificacao: z
    .string()
    .min(1, 'O código de verificação é obrigatório'),
  dataEmissao: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de emissão inválida'),
});
