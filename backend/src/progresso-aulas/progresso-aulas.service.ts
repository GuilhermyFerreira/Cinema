import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';

/**
 * Progresso_Aulas usa chave primária composta (ID_Usuario + ID_Aula), então
 * todas as operações pontuais recebem os dois identificadores.
 */
@Injectable()
export class ProgressoAulasService {
  constructor(private prisma: PrismaService) {}

  private chave(idUsuario: number, idAula: number) {
    return { idUsuario_idAula: { idUsuario, idAula } };
  }

  create(createProgressoAulaDto: CreateProgressoAulaDto) {
    return this.prisma.progressoAula.create({ data: createProgressoAulaDto });
  }

  /** Campos aceitos como filtro: idUsuario, idAula, status. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.progressoAula.findMany({
      where: montarWhere(filtro, ['idUsuario', 'idAula'], ['status']),
      orderBy: [{ idUsuario: 'asc' }, { idAula: 'asc' }],
    });
  }

  async findOne(idUsuario: number, idAula: number) {
    const registro = await this.prisma.progressoAula.findUnique({
      where: this.chave(idUsuario, idAula),
    });

    if (!registro) {
      throw new NotFoundException(
        `Progresso do usuário ${idUsuario} na aula ${idAula} não encontrado`,
      );
    }
    return registro;
  }

  async update(
    idUsuario: number,
    idAula: number,
    updateProgressoAulaDto: UpdateProgressoAulaDto,
  ) {
    await this.findOne(idUsuario, idAula);

    return this.prisma.progressoAula.update({
      where: this.chave(idUsuario, idAula),
      data: updateProgressoAulaDto,
    });
  }

  async remove(idUsuario: number, idAula: number) {
    await this.findOne(idUsuario, idAula);

    return this.prisma.progressoAula.delete({
      where: this.chave(idUsuario, idAula),
    });
  }
}
