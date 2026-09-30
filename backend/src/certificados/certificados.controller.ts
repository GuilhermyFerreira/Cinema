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
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

// Todas as rotas exigem token JWT.
@ApiTags('certificados')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'))
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um certificado' })
  @ApiResponse({ status: 201, description: 'Certificado criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  create(@Body() createCertificadoDto: CreateCertificadoDto) {
    return this.certificadosService.create(createCertificadoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar certificados' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll() {
    return this.certificadosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um certificado pelo ID' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.certificadosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um certificado' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificadoDto: UpdateCertificadoDto,
  ) {
    return this.certificadosService.update(id, updateCertificadoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um certificado' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificadosService.remove(id);
  }
}
