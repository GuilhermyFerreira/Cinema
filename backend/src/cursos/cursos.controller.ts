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
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar um curso' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursosService.create(createCursoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.cursosService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um curso pelo ID' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um curso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCursoDto: UpdateCursoDto,
  ) {
    return this.cursosService.update(id, updateCursoDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um curso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.remove(id);
  }
}
