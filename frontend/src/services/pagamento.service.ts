import { CrudService } from './http.service';
import type { IPagamento } from '../models';

class PagamentoService extends CrudService<IPagamento> {
  constructor() {
    super('pagamentos');
  }

  listarPorAssinatura(idAssinatura: string): Promise<IPagamento[]> {
    return this.listar({ idAssinatura });
  }

  /** Total faturado, usado no painel financeiro. */
  async totalFaturado(): Promise<number> {
    const pagamentos = await this.listar();
    return pagamentos.reduce((total, item) => total + item.valorPago, 0);
  }
}

export const pagamentoService = new PagamentoService();
