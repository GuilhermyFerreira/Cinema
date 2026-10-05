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
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

// Todas as rotas exigem token JWT.
@ApiTags('certificados')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), PapeisGuard)
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Papeis('Admin')
  @Post()
  @ApiOperation({ summary: 'Criar um certificado' })
  @ApiResponse({ status: 201, description: 'Certificado criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  create(@Body() createCertificadoDto: CreateCertificadoDto) {
    return this.certificadosService.create(createCertificadoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar certificados' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.certificadosService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um certificado pelo ID' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.certificadosService.findOne(id);
  }

  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um certificado' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificadoDto: UpdateCertificadoDto,
  ) {
    return this.certificadosService.update(id, updateCertificadoDto);
  }

  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um certificado' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificadosService.remove(id);
  }
}
