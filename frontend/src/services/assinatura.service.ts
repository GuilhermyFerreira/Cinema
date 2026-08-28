import { CrudService } from './http.service';
import type { IAssinatura } from '../models';

class AssinaturaService extends CrudService<IAssinatura> {
  constructor() {
    super('assinaturas');
  }

  listarPorUsuario(idUsuario: string): Promise<IAssinatura[]> {
    return this.listar({ idUsuario });
  }

  /** Uma assinatura está ativa enquanto a data atual não ultrapassa DataFim. */
  estaAtiva(assinatura: IAssinatura): boolean {
    return new Date(assinatura.dataFim) >= new Date();
  }
}

export const assinaturaService = new AssinaturaService();
