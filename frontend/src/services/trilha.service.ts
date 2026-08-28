import { CrudService } from './http.service';
import type { ITrilha, ITrilhaCurso } from '../models';

class TrilhaService extends CrudService<ITrilha> {
  constructor() {
    super('trilhas');
  }

  listarPorCategoria(idCategoria: string): Promise<ITrilha[]> {
    return this.listar({ idCategoria });
  }
}

class TrilhaCursoService extends CrudService<ITrilhaCurso> {
  constructor() {
    super('trilhasCursos');
  }

  /** Cursos de uma trilha já ordenados pelo campo Ordem. */
  async listarPorTrilha(idTrilha: string): Promise<ITrilhaCurso[]> {
    const vinculos = await this.listar({ idTrilha });
    return vinculos.sort((a, b) => a.ordem - b.ordem);
  }

  /** Próxima posição livre na sequência de cursos da trilha. */
  async proximaOrdem(idTrilha: string): Promise<number> {
    const vinculos = await this.listarPorTrilha(idTrilha);
    return vinculos.length ? Math.max(...vinculos.map((v) => v.ordem)) + 1 : 1;
  }

  /** Evita vincular o mesmo curso duas vezes na mesma trilha. */
  async jaVinculado(idTrilha: string, idCurso: string): Promise<boolean> {
    const encontrados = await this.listar({ idTrilha, idCurso });
    return encontrados.length > 0;
  }
}

export const trilhaService = new TrilhaService();
export const trilhaCursoService = new TrilhaCursoService();
