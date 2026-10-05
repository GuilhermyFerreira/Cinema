import { CrudService, request } from './http.service';
import type { IUsuario, Papel } from '../models';

class UsuarioService extends CrudService<IUsuario> {
  constructor() {
    super('usuarios', 'idUsuario');
  }

  /** Lista apenas usuários de um determinado papel (Admin ou Aluno). */
  listarPorPapel(papel: Papel): Promise<IUsuario[]> {
    return this.listar({ papel });
  }

  /** Verifica se o e-mail já está em uso por outro usuário (campo único). */
  async emailDisponivel(email: string, idAtual?: string): Promise<boolean> {
    const encontrados = await this.listar({ email });
    return encontrados.every((usuario) => usuario.id === idAtual);
  }

  /**
   * Promove ou rebaixa um usuário.
   *
   * O papel fica fora do CreateUsuarioDto de propósito — o autocadastro é
   * público, e aceitá-lo ali permitiria que qualquer visitante criasse um
   * administrador. Por isso existe esta rota própria, exclusiva de Admin.
   */
  async alterarPapel(id: string, papel: Papel): Promise<IUsuario> {
    const atualizado = await request<Record<string, unknown>>(
      `/usuarios/${id}/papel`,
      { method: 'PATCH', body: JSON.stringify({ papel }) },
    );

    return { ...atualizado, id: String(atualizado.idUsuario) } as IUsuario;
  }
}

export const usuarioService = new UsuarioService();
