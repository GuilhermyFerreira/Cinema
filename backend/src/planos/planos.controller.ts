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
import { PlanosService } from './planos.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

// Leitura é pública (vitrine do site); criar, editar e remover exige Admin.
@ApiTags('planos')
@Controller('planos')
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar um plano' })
  @ApiResponse({ status: 201, description: 'Plano criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createPlanoDto: CreatePlanoDto) {
    return this.planosService.create(createPlanoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar planos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.planosService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um plano pelo ID' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planosService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um plano' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanoDto: UpdatePlanoDto,
  ) {
    return this.planosService.update(id, updatePlanoDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um plano' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.planosService.remove(id);
  }
}
