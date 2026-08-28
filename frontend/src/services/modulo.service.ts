import { CrudService } from './http.service';
import type { IModulo } from '../models';

class ModuloService extends CrudService<IModulo> {
  constructor() {
    super('modulos');
  }

  /** Módulos de um curso já ordenados pelo campo Ordem. */
  async listarPorCurso(idCurso: string): Promise<IModulo[]> {
    const modulos = await this.listar({ idCurso });
    return modulos.sort((a, b) => a.ordem - b.ordem);
  }

  /** Próxima posição livre na sequência de módulos do curso. */
  async proximaOrdem(idCurso: string): Promise<number> {
    const modulos = await this.listarPorCurso(idCurso);
    return modulos.length ? Math.max(...modulos.map((m) => m.ordem)) + 1 : 1;
  }
}

export const moduloService = new ModuloService();
