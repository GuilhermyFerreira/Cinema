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
import { TrilhasService } from './trilhas.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('trilhas')
@Controller('trilhas')
export class TrilhasController {
  constructor(private readonly trilhasService: TrilhasService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar uma trilha' })
  @ApiResponse({ status: 201, description: 'Trilha criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createTrilhaDto: CreateTrilhaDto) {
    return this.trilhasService.create(createTrilhaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar trilhas' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.trilhasService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma trilha pelo ID' })
  @ApiResponse({ status: 404, description: 'Trilha não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma trilha' })
  @ApiResponse({ status: 404, description: 'Trilha não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrilhaDto: UpdateTrilhaDto,
  ) {
    return this.trilhasService.update(id, updateTrilhaDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma trilha' })
  @ApiResponse({ status: 404, description: 'Trilha não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.remove(id);
  }
}
