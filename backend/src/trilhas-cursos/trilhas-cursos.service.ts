import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';

/**
 * Trilhas_Cursos é a tabela associativa entre Trilhas e Cursos, com chave
 * primária composta (ID_Trilha + ID_Curso) e o campo Ordem definindo a
 * sequência dos cursos dentro da trilha.
 */
@Injectable()
export class TrilhasCursosService {
  constructor(private prisma: PrismaService) {}

  private chave(idTrilha: number, idCurso: number) {
    return { idTrilha_idCurso: { idTrilha, idCurso } };
  }

  create(createTrilhaCursoDto: CreateTrilhaCursoDto) {
    return this.prisma.trilhaCurso.create({ data: createTrilhaCursoDto });
  }

  findAll() {
    return this.prisma.trilhaCurso.findMany({
      orderBy: [{ idTrilha: 'asc' }, { ordem: 'asc' }],
    });
  }

  async findOne(idTrilha: number, idCurso: number) {
    const registro = await this.prisma.trilhaCurso.findUnique({
      where: this.chave(idTrilha, idCurso),
    });

    if (!registro) {
      throw new NotFoundException(
        `O curso ${idCurso} não está vinculado à trilha ${idTrilha}`,
      );
    }
    return registro;
  }

  async update(
    idTrilha: number,
    idCurso: number,
    updateTrilhaCursoDto: UpdateTrilhaCursoDto,
  ) {
    await this.findOne(idTrilha, idCurso);

    return this.prisma.trilhaCurso.update({
      where: this.chave(idTrilha, idCurso),
      data: updateTrilhaCursoDto,
    });
  }

  async remove(idTrilha: number, idCurso: number) {
    await this.findOne(idTrilha, idCurso);

    return this.prisma.trilhaCurso.delete({
      where: this.chave(idTrilha, idCurso),
    });
  }
}
