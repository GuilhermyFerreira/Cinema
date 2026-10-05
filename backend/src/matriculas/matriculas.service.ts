import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';

@Injectable()
export class MatriculasService {
  constructor(private prisma: PrismaService) {}

  create(createMatriculaDto: CreateMatriculaDto) {
    return this.prisma.matricula.create({ data: createMatriculaDto });
  }

  /** Campos aceitos como filtro: idUsuario, idCurso. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.matricula.findMany({
      where: montarWhere(filtro, ['idUsuario', 'idCurso'], []),
      orderBy: { idMatricula: 'asc' },
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.matricula.findUnique({
      where: { idMatricula: id },
    });

    if (!registro)
      throw new NotFoundException(`Matrícula ${id} não encontrada`);
    return registro;
  }

  async update(id: number, updateMatriculaDto: UpdateMatriculaDto) {
    await this.findOne(id);

    return this.prisma.matricula.update({
      where: { idMatricula: id },
      data: updateMatriculaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.matricula.delete({ where: { idMatricula: id } });
  }
}
