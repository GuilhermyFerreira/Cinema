import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  create(createModuloDto: CreateModuloDto) {
    return this.prisma.modulo.create({ data: createModuloDto });
  }

  /** Campos aceitos como filtro: idCurso. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.modulo.findMany({
      where: montarWhere(filtro, ['idCurso'], []),
      orderBy: [{ idCurso: 'asc' }, { ordem: 'asc' }],
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.modulo.findUnique({
      where: { idModulo: id },
    });

    if (!registro) throw new NotFoundException(`Módulo ${id} não encontrado`);
    return registro;
  }

  async update(id: number, updateModuloDto: UpdateModuloDto) {
    await this.findOne(id);

    return this.prisma.modulo.update({
      where: { idModulo: id },
      data: updateModuloDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.modulo.delete({ where: { idModulo: id } });
  }
}
