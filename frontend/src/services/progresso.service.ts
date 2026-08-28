import { CrudService } from './http.service';
import type { IProgressoAula, StatusProgresso } from '../models';

class ProgressoService extends CrudService<IProgressoAula> {
  constructor() {
    super('progressoAulas');
  }

  listarPorUsuario(idUsuario: string): Promise<IProgressoAula[]> {
    return this.listar({ idUsuario });
  }

  /**
   * Registra ou atualiza o progresso de uma aula. O par (idUsuario, idAula)
   * funciona como chave composta, então um registro existente é atualizado
   * em vez de duplicado.
   */
  async registrar(
    idUsuario: string,
    idAula: string,
    status: StatusProgresso,
  ): Promise<IProgressoAula> {
    const existentes = await this.listar({ idUsuario, idAula });
    const dados = {
      idUsuario,
      idAula,
      status,
      dataConclusao: new Date().toISOString(),
    };

    const registroAtual = existentes[0];
    if (registroAtual?.id) {
      return this.atualizar(registroAtual.id, dados);
    }
    return this.criar(dados);
  }

  /** Remove a marcação de conclusão de uma aula. */
  async desmarcar(idUsuario: string, idAula: string): Promise<void> {
    const existentes = await this.listar({ idUsuario, idAula });
    await Promise.all(
      existentes.filter((p) => p.id).map((p) => this.excluir(p.id as string)),
    );
  }
}

export const progressoService = new ProgressoService();
