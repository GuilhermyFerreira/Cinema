import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulasService {
  constructor(private prisma: PrismaService) {}

  create(createAulaDto: CreateAulaDto) {
    return this.prisma.aula.create({ data: createAulaDto });
  }

  /** Campos aceitos como filtro: idModulo, tipoConteudo. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.aula.findMany({
      where: montarWhere(filtro, ['idModulo'], ['tipoConteudo']),
      orderBy: [{ idModulo: 'asc' }, { ordem: 'asc' }],
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.aula.findUnique({
      where: { idAula: id },
    });

    if (!registro) throw new NotFoundException(`Aula ${id} não encontrada`);
    return registro;
  }

  async update(id: number, updateAulaDto: UpdateAulaDto) {
    await this.findOne(id);

    return this.prisma.aula.update({
      where: { idAula: id },
      data: updateAulaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.aula.delete({ where: { idAula: id } });
  }
}
