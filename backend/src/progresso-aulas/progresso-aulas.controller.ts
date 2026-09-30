import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
@UseGuards(AuthGuard('jwt'))
@Controller('progresso-aulas')
export class ProgressoAulasController {
  constructor(private readonly progressoAulasService: ProgressoAulasService) {}

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
  create(@Body() createProgressoAulaDto: CreateProgressoAulaDto) {
    return this.progressoAulasService.create(createProgressoAulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros de progresso' })
  findAll() {
    return this.progressoAulasService.findAll();
  }

  @Get(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Buscar o progresso pela chave composta' })
  @ApiResponse({ status: 404, description: 'Progresso não encontrado.' })
  findOne(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idAula', ParseIntPipe) idAula: number,
  ) {
    return this.progressoAulasService.findOne(idUsuario, idAula);
  }

  @Patch(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Atualizar o progresso de uma aula' })
  @ApiResponse({ status: 404, description: 'Progresso não encontrado.' })
  update(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idAula', ParseIntPipe) idAula: number,
    @Body() updateProgressoAulaDto: UpdateProgressoAulaDto,
  ) {
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
  ) {
    return this.progressoAulasService.remove(idUsuario, idAula);
  }
}
