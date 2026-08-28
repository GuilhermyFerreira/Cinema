import { CrudService } from './http.service';
import type { IPlano } from '../models';

class PlanoService extends CrudService<IPlano> {
  constructor() {
    super('planos');
  }

  /** Planos ordenados do mais barato para o mais caro (vitrine do checkout). */
  async listarOrdenadosPorPreco(): Promise<IPlano[]> {
    const planos = await this.listar();
    return planos.sort((a, b) => a.preco - b.preco);
  }
}

export const planoService = new PlanoService();
