import { z } from 'zod';

/**
 * Tabela: Pagamentos
 * ID_Pagamento (PK) | ID_Assinatura (FK, not null) | ValorPago (not null)
 * DataPagamento (not null) | MetodoPagamento (not null) | Id_Transacao_Gateway (not null)
 */
export const METODOS_PAGAMENTO = [
  'Cartão de Crédito',
  'Cartão de Débito',
  'Pix',
  'Boleto',
] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

export interface IPagamento {
  id?: string;
  idAssinatura: string;
  valorPago: number;
  dataPagamento: string;
  metodoPagamento: MetodoPagamento;
  idTransacaoGateway: string;
}

export const pagamentoSchema = z.object({
  id: z.string().optional(),
  idAssinatura: z.string().min(1, 'Informe a assinatura correspondente'),
  valorPago: z.coerce.number().min(0, 'O valor pago não pode ser negativo'),
  dataPagamento: z
    .string()
    .refine((valor) => !isNaN(Date.parse(valor)), 'Data do pagamento inválida'),
  metodoPagamento: z.enum(METODOS_PAGAMENTO),
  idTransacaoGateway: z
    .string()
    .min(1, 'O ID da transação é obrigatório'),
});
