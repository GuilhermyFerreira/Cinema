import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  create(createPagamentoDto: CreatePagamentoDto) {
    return this.prisma.pagamento.create({ data: createPagamentoDto });
  }

  findAll() {
    return this.prisma.pagamento.findMany({ orderBy: { idPagamento: 'asc' } });
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
