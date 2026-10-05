import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import type { UsuarioAutenticado } from '../auth/usuario-atual.decorator';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Diferente dos demais recursos, o pagamento não guarda o usuário: ele aponta
   * para a assinatura. Então a checagem de dono passa pela assinatura — sem
   * isso, um aluno poderia registrar pagamentos na assinatura de outra pessoa.
   */
  async create(
    createPagamentoDto: CreatePagamentoDto,
    atual: UsuarioAutenticado,
  ) {
    if (atual.papel !== 'Admin') {
      const assinatura = await this.prisma.assinatura.findUnique({
        where: { idAssinatura: createPagamentoDto.idAssinatura },
      });

      if (!assinatura) {
        throw new NotFoundException(
          `Assinatura ${createPagamentoDto.idAssinatura} não encontrada`,
        );
      }

      if (assinatura.idUsuario !== atual.userId) {
        throw new ForbiddenException(
          'Você só pode registrar pagamentos das suas próprias assinaturas',
        );
      }
    }

    return this.prisma.pagamento.create({ data: createPagamentoDto });
  }

  /** Campos aceitos como filtro: idAssinatura, metodoPagamento. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.pagamento.findMany({
      where: montarWhere(filtro, ['idAssinatura'], ['metodoPagamento']),
      orderBy: { idPagamento: 'asc' },
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.pagamento.findUnique({
      where: { idPagamento: id },
    });

    if (!registro)
      throw new NotFoundException(`Pagamento ${id} não encontrado`);
    return registro;
  }

  async update(id: number, updatePagamentoDto: UpdatePagamentoDto) {
    await this.findOne(id);

    return this.prisma.pagamento.update({
      where: { idPagamento: id },
      data: updatePagamentoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.pagamento.delete({ where: { idPagamento: id } });
  }
}
