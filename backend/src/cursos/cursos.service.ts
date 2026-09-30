import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  create(createCursoDto: CreateCursoDto) {
    return this.prisma.curso.create({ data: createCursoDto });
  }

  findAll() {
    return this.prisma.curso.findMany({ orderBy: { idCurso: 'asc' } });
  }

  async findOne(id: number) {
    const registro = await this.prisma.curso.findUnique({
      where: { idCurso: id },
    });

    if (!registro) throw new NotFoundException(`Curso ${id} não encontrado`);
    return registro;
  }

  async update(id: number, updateCursoDto: UpdateCursoDto) {
    await this.findOne(id);

    return this.prisma.curso.update({
      where: { idCurso: id },
      data: updateCursoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.curso.delete({ where: { idCurso: id } });
  }
}
