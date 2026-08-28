import { CrudService } from './http.service';
import type { IUsuario, PerfilUsuario } from '../models';

class UsuarioService extends CrudService<IUsuario> {
  constructor() {
    super('usuarios');
  }

  /** Lista apenas usuários de um determinado perfil (Aluno ou Instrutor). */
  listarPorPerfil(perfil: PerfilUsuario): Promise<IUsuario[]> {
    return this.listar({ perfil });
  }

  /** Verifica se o e-mail já está em uso por outro usuário (campo Unique). */
  async emailDisponivel(email: string, idAtual?: string): Promise<boolean> {
    const encontrados = await this.listar({ email });
    return encontrados.every((usuario) => usuario.id === idAtual);
  }
}

export const usuarioService = new UsuarioService();
