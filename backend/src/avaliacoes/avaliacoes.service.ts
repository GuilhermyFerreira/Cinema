import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  create(createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.prisma.avaliacao.create({ data: createAvaliacaoDto });
  }

  findAll() {
    return this.prisma.avaliacao.findMany({ orderBy: { idAvaliacao: 'asc' } });
  }

  async findOne(id: number) {
    const registro = await this.prisma.avaliacao.findUnique({
      where: { idAvaliacao: id },
    });

    if (!registro)
      throw new NotFoundException(`Avaliação ${id} não encontrada`);
    return registro;
  }

  async update(id: number, updateAvaliacaoDto: UpdateAvaliacaoDto) {
    await this.findOne(id);

    return this.prisma.avaliacao.update({
      where: { idAvaliacao: id },
      data: updateAvaliacaoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.avaliacao.delete({ where: { idAvaliacao: id } });
  }
}
