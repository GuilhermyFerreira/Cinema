import { z } from 'zod';

/**
 * Tabela: Aulas
 * ID_Aula (PK) | ID_Modulo (FK) | Titulo | TipoConteudo | URL_Conteudo
 * DuracaoMinutos | Ordem
 */
export const TIPOS_CONTEUDO = ['Vídeo', 'Texto', 'Quiz'] as const;
export type TipoConteudo = (typeof TIPOS_CONTEUDO)[number];

export interface IAula {
  id?: string;
  idModulo: string;
  titulo: string;
  tipoConteudo: TipoConteudo;
  urlConteudo: string;
  duracaoMinutos: number;
  ordem: number;
}

export const aulaSchema = z.object({
  id: z.string().optional(),
  idModulo: z.string().min(1, 'A aula precisa pertencer a um módulo'),
  titulo: z
    .string()
    .min(1, 'O título da aula é obrigatório')
    .min(3, 'O título deve ter no mínimo 3 caracteres'),
  tipoConteudo: z.enum(TIPOS_CONTEUDO),
  urlConteudo: z
    .string()
    .min(1, 'A URL do conteúdo é obrigatória')
    .url('Informe uma URL válida'),
  duracaoMinutos: z.coerce
    .number()
    .min(1, 'A duração deve ser maior que zero'),
  ordem: z.coerce.number().min(1, 'A ordem deve ser maior ou igual a 1'),
});
