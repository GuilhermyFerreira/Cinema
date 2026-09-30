import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  create(createCategoriaDto: CreateCategoriaDto) {
    return this.prisma.categoria.create({ data: createCategoriaDto });
  }

  findAll() {
    return this.prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: number) {
    const registro = await this.prisma.categoria.findUnique({
      where: { idCategoria: id },
    });

    if (!registro)
      throw new NotFoundException(`Categoria ${id} não encontrada`);
    return registro;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);

    return this.prisma.categoria.update({
      where: { idCategoria: id },
      data: updateCategoriaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.categoria.delete({ where: { idCategoria: id } });
  }
}
