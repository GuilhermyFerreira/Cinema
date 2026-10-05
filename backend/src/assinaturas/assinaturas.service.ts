import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';

@Injectable()
export class AssinaturasService {
  constructor(private prisma: PrismaService) {}

  create(createAssinaturaDto: CreateAssinaturaDto) {
    return this.prisma.assinatura.create({ data: createAssinaturaDto });
  }

  /** Campos aceitos como filtro: idUsuario, idPlano. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.assinatura.findMany({
      where: montarWhere(filtro, ['idUsuario', 'idPlano'], []),
      orderBy: { idAssinatura: 'asc' },
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.assinatura.findUnique({
      where: { idAssinatura: id },
    });

    if (!registro)
      throw new NotFoundException(`Assinatura ${id} não encontrada`);
    return registro;
  }

  async update(id: number, updateAssinaturaDto: UpdateAssinaturaDto) {
    await this.findOne(id);

    return this.prisma.assinatura.update({
      where: { idAssinatura: id },
      data: updateAssinaturaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.assinatura.delete({ where: { idAssinatura: id } });
  }
}
