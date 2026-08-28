import { z } from 'zod';

/**
 * Tabela: Assinaturas
 * ID_Assinatura (PK) | ID_Usuario (FK, not null) | ID_Plano (FK, not null)
 * DataInicio (not null) | DataFim (not null)
 */
export interface IAssinatura {
  id?: string;
  idUsuario: string;
  idPlano: string;
  dataInicio: string;
  dataFim: string;
}

export const assinaturaSchema = z.object({
  id: z.string().optional(),
  idUsuario: z.string().min(1, 'Selecione o assinante'),
  idPlano: z.string().min(1, 'Selecione o plano'),
  dataInicio: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de início inválida'),
  dataFim: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data de término inválida'),
});
