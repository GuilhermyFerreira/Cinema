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
import { TrilhasCursosService } from './trilhas-cursos.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';

// Todas as rotas exigem token JWT.
@ApiTags('trilhas-cursos')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'))
@Controller('trilhas-cursos')
export class TrilhasCursosController {
  constructor(private readonly trilhasCursosService: TrilhasCursosService) {}

  @Post()
  @ApiOperation({ summary: 'Vincular um curso a uma trilha' })
  @ApiResponse({ status: 201, description: 'Curso vinculado com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Este curso já faz parte da trilha.',
  })
  create(@Body() createTrilhaCursoDto: CreateTrilhaCursoDto) {
    return this.trilhasCursosService.create(createTrilhaCursoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os vínculos entre trilhas e cursos' })
  findAll() {
    return this.trilhasCursosService.findAll();
  }

  @Get(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Buscar o vínculo pela chave composta' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado.' })
  findOne(
    @Param('idTrilha', ParseIntPipe) idTrilha: number,
    @Param('idCurso', ParseIntPipe) idCurso: number,
  ) {
    return this.trilhasCursosService.findOne(idTrilha, idCurso);
  }

  @Patch(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Alterar a ordem do curso na trilha' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado.' })
  update(
    @Param('idTrilha', ParseIntPipe) idTrilha: number,
    @Param('idCurso', ParseIntPipe) idCurso: number,
    @Body() updateTrilhaCursoDto: UpdateTrilhaCursoDto,
  ) {
    return this.trilhasCursosService.update(
      idTrilha,
      idCurso,
      updateTrilhaCursoDto,
    );
  }

  @Delete(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Remover o curso da trilha' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado.' })
  remove(
    @Param('idTrilha', ParseIntPipe) idTrilha: number,
    @Param('idCurso', ParseIntPipe) idCurso: number,
  ) {
    return this.trilhasCursosService.remove(idTrilha, idCurso);
  }
}
