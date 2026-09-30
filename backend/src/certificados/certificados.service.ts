import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

@Injectable()
export class CertificadosService {
  constructor(private prisma: PrismaService) {}

  create(createCertificadoDto: CreateCertificadoDto) {
    return this.prisma.certificado.create({ data: createCertificadoDto });
  }

  findAll() {
    return this.prisma.certificado.findMany({
      orderBy: { idCertificado: 'asc' },
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.certificado.findUnique({
      where: { idCertificado: id },
    });

    if (!registro)
      throw new NotFoundException(`Certificado ${id} não encontrado`);
    return registro;
  }

  async update(id: number, updateCertificadoDto: UpdateCertificadoDto) {
    await this.findOne(id);

    return this.prisma.certificado.update({
      where: { idCertificado: id },
      data: updateCertificadoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.certificado.delete({ where: { idCertificado: id } });
  }
}
