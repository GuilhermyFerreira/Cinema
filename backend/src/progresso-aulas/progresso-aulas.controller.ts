import {
  Body,
  Controller,
  ForbiddenException,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PapeisGuard } from '../auth/papeis.guard';
import {
  UsuarioAtual,
  type UsuarioAutenticado,
} from '../auth/usuario-atual.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProgressoAulasService } from './progresso-aulas.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';

// Todas as rotas exigem token JWT.
@ApiTags('progresso-aulas')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), PapeisGuard)
@Controller('progresso-aulas')
export class ProgressoAulasController {
  constructor(private readonly progressoAulasService: ProgressoAulasService) {}

  /**
   * O aluno só enxerga e altera o próprio progresso; o Admin, o de qualquer um.
   * Como o idUsuario faz parte da rota, basta compará-lo com o do token.
   */
  private exigirDono(idUsuario: number, atual: UsuarioAutenticado): void {
    if (atual.papel !== 'Admin' && idUsuario !== atual.userId) {
      throw new ForbiddenException(
        'Você só pode acessar o seu próprio progresso',
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Registrar o progresso de um aluno em uma aula' })
  @ApiResponse({
    status: 201,
    description: 'Progresso registrado com sucesso.',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe progresso para este aluno nesta aula.',
  })
  create(
    @Body() createProgressoAulaDto: CreateProgressoAulaDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    // O aluno registra progresso apenas para si mesmo.
    const dados =
      atual.papel === 'Admin'
        ? createProgressoAulaDto
        : { ...createProgressoAulaDto, idUsuario: atual.userId };

    return this.progressoAulasService.create(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros de progresso' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.progressoAulasService.findAll(filtro);
  }

  @Get(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Buscar o progresso pela chave composta' })
  @ApiResponse({ status: 404, description: 'Progresso não encontrado.' })
  findOne(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idAula', ParseIntPipe) idAula: number,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    this.exigirDono(idUsuario, atual);
    return this.progressoAulasService.findOne(idUsuario, idAula);
  }

  @Patch(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Atualizar o progresso de uma aula' })
  @ApiResponse({ status: 404, description: 'Progresso não encontrado.' })
  update(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idAula', ParseIntPipe) idAula: number,
    @Body() updateProgressoAulaDto: UpdateProgressoAulaDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    this.exigirDono(idUsuario, atual);

    return this.progressoAulasService.update(
      idUsuario,
      idAula,
      updateProgressoAulaDto,
    );
  }

  @Delete(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Remover o registro de progresso' })
  @ApiResponse({ status: 404, description: 'Progresso não encontrado.' })
  remove(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idAula', ParseIntPipe) idAula: number,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    this.exigirDono(idUsuario, atual);
    return this.progressoAulasService.remove(idUsuario, idAula);
  }
}
