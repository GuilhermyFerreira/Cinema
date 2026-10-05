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
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('modulos')
@Controller('modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar um módulo' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.modulosService.create(createModuloDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar modulos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.modulosService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um módulo pelo ID' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modulosService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuloDto: UpdateModuloDto,
  ) {
    return this.modulosService.update(id, updateModuloDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um módulo' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulosService.remove(id);
  }
}
