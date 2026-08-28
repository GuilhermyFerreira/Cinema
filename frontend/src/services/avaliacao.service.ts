import { CrudService } from './http.service';
import type { IAvaliacao } from '../models';

class AvaliacaoService extends CrudService<IAvaliacao> {
  constructor() {
    super('avaliacoes');
  }

  listarPorCurso(idCurso: string): Promise<IAvaliacao[]> {
    return this.listar({ idCurso });
  }

  /** Média das notas de um curso, ou null quando ainda não há avaliações. */
  async mediaDoCurso(idCurso: string): Promise<number | null> {
    const avaliacoes = await this.listarPorCurso(idCurso);
    if (!avaliacoes.length) return null;
    const soma = avaliacoes.reduce((total, item) => total + item.nota, 0);
    return soma / avaliacoes.length;
  }
}

export const avaliacaoService = new AvaliacaoService();
