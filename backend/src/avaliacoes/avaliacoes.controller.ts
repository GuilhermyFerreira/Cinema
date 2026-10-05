import {
  Body,
  Controller,
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
import { Papeis } from '../auth/papeis.decorator';
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
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

// Todas as rotas exigem token JWT.
@ApiTags('avaliacoes')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), PapeisGuard)
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  create(
    @Body() createAvaliacaoDto: CreateAvaliacaoDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    // O aluno só cria registros para si mesmo; o Admin, para qualquer usuário.
    const dados =
      atual.papel === 'Admin'
        ? createAvaliacaoDto
        : { ...createAvaliacaoDto, idUsuario: atual.userId };

    return this.avaliacoesService.create(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Listar avaliacoes' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.avaliacoesService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma avaliação pelo ID' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.avaliacoesService.findOne(id);
  }

  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma avaliação' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
  ) {
    return this.avaliacoesService.update(id, updateAvaliacaoDto);
  }

  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma avaliação' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.avaliacoesService.remove(id);
  }
}
