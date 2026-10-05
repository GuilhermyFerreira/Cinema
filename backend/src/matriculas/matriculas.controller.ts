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
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';

// Todas as rotas exigem token JWT.
@ApiTags('matriculas')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), PapeisGuard)
@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma matrícula' })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  create(
    @Body() createMatriculaDto: CreateMatriculaDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    // O aluno só cria registros para si mesmo; o Admin, para qualquer usuário.
    const dados =
      atual.papel === 'Admin'
        ? createMatriculaDto
        : { ...createMatriculaDto, idUsuario: atual.userId };

    return this.matriculasService.create(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Listar matriculas' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.matriculasService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matriculasService.findOne(id);
  }

  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma matrícula' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatriculaDto: UpdateMatriculaDto,
  ) {
    return this.matriculasService.update(id, updateMatriculaDto);
  }

  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matriculasService.remove(id);
  }
}
