import { CrudCompostoService } from './http.service';
import type { IProgressoAula, StatusProgresso } from '../models';

/**
 * Progresso_Aulas tem chave primária composta (usuário + aula), então as rotas
 * pontuais da API recebem os dois identificadores. Para as telas, cada registro
 * continua tendo um `id` único, montado pela classe base.
 */
class ProgressoService extends CrudCompostoService<IProgressoAula> {
  constructor() {
    super('progresso-aulas', 'idUsuario', 'idAula');
  }

  listarPorUsuario(idUsuario: string): Promise<IProgressoAula[]> {
    return this.listar({ idUsuario });
  }

  /**
   * Registra ou atualiza o progresso de uma aula. Como o par (usuário, aula) é
   * a chave, um registro existente é atualizado em vez de duplicado.
   */
  async registrar(
    idUsuario: string,
    idAula: string,
    status: StatusProgresso,
  ): Promise<IProgressoAula> {
    const existentes = await this.listar({ idUsuario, idAula });
    const dataConclusao = new Date().toISOString();

    if (existentes.length) {
      return this.atualizar(`${idUsuario}-${idAula}`, {
        status,
        dataConclusao,
      });
    }

    return this.criar({ idUsuario, idAula, status, dataConclusao });
  }

  /** Remove a marcação de conclusão de uma aula. */
  async desmarcar(idUsuario: string, idAula: string): Promise<void> {
    const existentes = await this.listar({ idUsuario, idAula });
    if (existentes.length) {
      await this.excluir(`${idUsuario}-${idAula}`);
    }
  }
}

export const progressoService = new ProgressoService();
