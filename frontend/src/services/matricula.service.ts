import { CrudService } from './http.service';
import type { IMatricula } from '../models';

class MatriculaService extends CrudService<IMatricula> {
  constructor() {
    super('matriculas');
  }

  listarPorUsuario(idUsuario: string): Promise<IMatricula[]> {
    return this.listar({ idUsuario });
  }

  listarPorCurso(idCurso: string): Promise<IMatricula[]> {
    return this.listar({ idCurso });
  }

  /** Impede que o mesmo aluno seja matriculado duas vezes no mesmo curso. */
  async jaMatriculado(idUsuario: string, idCurso: string): Promise<boolean> {
    const encontradas = await this.listar({ idUsuario, idCurso });
    return encontradas.length > 0;
  }

  /** Registra a conclusão do curso preenchendo DataConclusao. */
  async concluir(id: string, dataConclusao: string): Promise<IMatricula> {
    const matricula = await this.obter(id);
    return this.atualizar(id, { ...matricula, dataConclusao });
  }
}

export const matriculaService = new MatriculaService();
