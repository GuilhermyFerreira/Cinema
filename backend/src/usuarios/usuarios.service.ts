import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // Biblioteca para hash de senha
import { PrismaService } from '../prisma/prisma.service';
import { montarWhere } from '../comum/filtros';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import type { Papel } from '../generated/prisma/enums';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

/**
 * O hash da senha nunca deve sair da API, então todas as consultas de leitura
 * omitem a coluna `senhaHash`. A única exceção é `findByEmail`, usado pelo
 * AuthService para comparar a senha durante o login.
 */
const OMITIR_SENHA = { senhaHash: true } as const;

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { senha, ...dados } = createUsuarioDto;

    // Gera um salt e cria o hash da senha enviada pelo DTO
    const salt = await bcrypt.genSalt();
    const senhaHash = await bcrypt.hash(senha, salt);

    // Salva o usuário no banco com a senha criptografada
    return this.prisma.usuario.create({
      data: { ...dados, senhaHash },
      omit: OMITIR_SENHA,
    });
  }

  // Método essencial para buscar usuário pelo e-mail durante o login.
  // Retorna o registro completo, pois o hash é necessário na comparação.
  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  /** Campos aceitos como filtro: email, papel. */
  findAll(filtro: Record<string, unknown> = {}) {
    return this.prisma.usuario.findMany({
      where: montarWhere(filtro, [], ['email', 'papel']),
      omit: OMITIR_SENHA,
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: id },
      omit: OMITIR_SENHA,
    });

    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);

    const { senha, ...dados } = updateUsuarioDto;

    // Se a senha for alterada, ela também precisa ser convertida em hash.
    const senhaHash = senha
      ? await bcrypt.hash(senha, await bcrypt.genSalt())
      : undefined;

    return this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { ...dados, ...(senhaHash ? { senhaHash } : {}) },
      omit: OMITIR_SENHA,
    });
  }

  /** Promove ou rebaixa um usuário. Só o Admin chega até aqui. */
  async alterarPapel(id: number, papel: Papel) {
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { papel },
      omit: OMITIR_SENHA,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.usuario.delete({
      where: { idUsuario: id },
      omit: OMITIR_SENHA,
    });
  }
}
