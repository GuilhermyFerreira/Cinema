import { CrudService } from './http.service';
import type { IAula } from '../models';

class AulaService extends CrudService<IAula> {
  constructor() {
    super('aulas');
  }

  /** Aulas de um módulo já ordenadas pelo campo Ordem. */
  async listarPorModulo(idModulo: string): Promise<IAula[]> {
    const aulas = await this.listar({ idModulo });
    return aulas.sort((a, b) => a.ordem - b.ordem);
  }

  /** Próxima posição livre na sequência de aulas do módulo. */
  async proximaOrdem(idModulo: string): Promise<number> {
    const aulas = await this.listarPorModulo(idModulo);
    return aulas.length ? Math.max(...aulas.map((a) => a.ordem)) + 1 : 1;
  }
}

export const aulaService = new AulaService();
