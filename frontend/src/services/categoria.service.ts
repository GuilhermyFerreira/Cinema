import { CrudService } from './http.service';
import type { ICategoria } from '../models';

class CategoriaService extends CrudService<ICategoria> {
  constructor() {
    super('categorias');
  }

  /** Verifica se o nome já está em uso por outra categoria (campo Unique). */
  async nomeDisponivel(nome: string, idAtual?: string): Promise<boolean> {
    const encontradas = await this.listar({ nome });
    return encontradas.every((categoria) => categoria.id === idAtual);
  }
}

export const categoriaService = new CategoriaService();
