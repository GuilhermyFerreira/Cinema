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
import { AulasService } from './aulas.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('aulas')
@Controller('aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar uma aula' })
  @ApiResponse({ status: 201, description: 'Aula criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulasService.create(createAulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar aulas' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.aulasService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma aula pelo ID' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aulasService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma aula' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAulaDto: UpdateAulaDto,
  ) {
    return this.aulasService.update(id, updateAulaDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma aula' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aulasService.remove(id);
  }
}
