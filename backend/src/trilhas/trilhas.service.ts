import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

@Injectable()
export class TrilhasService {
  constructor(private prisma: PrismaService) {}

  create(createTrilhaDto: CreateTrilhaDto) {
    return this.prisma.trilha.create({ data: createTrilhaDto });
  }

  findAll() {
    return this.prisma.trilha.findMany({ orderBy: { idTrilha: 'asc' } });
  }

  async findOne(id: number) {
    const registro = await this.prisma.trilha.findUnique({
      where: { idTrilha: id },
    });

    if (!registro) throw new NotFoundException(`Trilha ${id} não encontrada`);
    return registro;
  }

  async update(id: number, updateTrilhaDto: UpdateTrilhaDto) {
    await this.findOne(id);

    return this.prisma.trilha.update({
      where: { idTrilha: id },
      data: updateTrilhaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.trilha.delete({ where: { idTrilha: id } });
  }
}
