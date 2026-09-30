import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@Injectable()
export class PlanosService {
  constructor(private prisma: PrismaService) {}

  create(createPlanoDto: CreatePlanoDto) {
    return this.prisma.plano.create({ data: createPlanoDto });
  }

  findAll() {
    return this.prisma.plano.findMany({ orderBy: { preco: 'asc' } });
  }

  async findOne(id: number) {
    const registro = await this.prisma.plano.findUnique({
      where: { idPlano: id },
    });

    if (!registro) throw new NotFoundException(`Plano ${id} não encontrado`);
    return registro;
  }

  async update(id: number, updatePlanoDto: UpdatePlanoDto) {
    await this.findOne(id);

    return this.prisma.plano.update({
      where: { idPlano: id },
      data: updatePlanoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.plano.delete({ where: { idPlano: id } });
  }
}
