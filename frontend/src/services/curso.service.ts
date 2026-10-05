import { CrudService } from './http.service';
import type { ICurso } from '../models';

class CursoService extends CrudService<ICurso> {
  constructor() {
    super('cursos', 'idCurso');
  }

  /** Cursos de uma categoria específica (relação Categorias 1:N Cursos). */
  listarPorCategoria(idCategoria: string): Promise<ICurso[]> {
    return this.listar({ idCategoria });
  }

  /** Cursos ministrados por um instrutor. */
  listarPorInstrutor(idInstrutor: string): Promise<ICurso[]> {
    return this.listar({ idInstrutor });
  }
}

export const cursoService = new CursoService();
