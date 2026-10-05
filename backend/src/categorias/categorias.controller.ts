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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar uma categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.categoriasService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma categoria pelo ID' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma categoria' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma categoria' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
