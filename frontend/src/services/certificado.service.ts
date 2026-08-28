import { CrudService } from './http.service';
import type { ICertificado } from '../models';

class CertificadoService extends CrudService<ICertificado> {
  constructor() {
    super('certificados');
  }

  listarPorUsuario(idUsuario: string): Promise<ICertificado[]> {
    return this.listar({ idUsuario });
  }

  /** Consulta pública pelo código de verificação (campo Unique). */
  async verificar(codigoVerificacao: string): Promise<ICertificado | null> {
    const encontrados = await this.listar({ codigoVerificacao });
    return encontrados[0] ?? null;
  }

  /** Um mesmo curso não gera dois certificados para o mesmo aluno. */
  async jaEmitido(idUsuario: string, idCurso: string): Promise<boolean> {
    const encontrados = await this.listar({ idUsuario, idCurso });
    return encontrados.length > 0;
  }
}

export const certificadoService = new CertificadoService();
