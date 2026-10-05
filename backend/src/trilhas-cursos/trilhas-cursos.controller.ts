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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrilhasCursosService } from './trilhas-cursos.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('trilhas-cursos')
@Controller('trilhas-cursos')
export class TrilhasCursosController {
  constructor(private readonly trilhasCursosService: TrilhasCursosService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
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
  findAll(@Query() filtro: Record<string, string>) {
    return this.trilhasCursosService.findAll(filtro);
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

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
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

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
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
