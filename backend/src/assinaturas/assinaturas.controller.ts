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
  UsuarioAtual,
  type UsuarioAutenticado,
} from '../auth/usuario-atual.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssinaturasService } from './assinaturas.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';

// Todas as rotas exigem token JWT.
@ApiTags('assinaturas')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), PapeisGuard)
@Controller('assinaturas')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma assinatura' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  create(
    @Body() createAssinaturaDto: CreateAssinaturaDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    // O aluno só cria registros para si mesmo; o Admin, para qualquer usuário.
    const dados =
      atual.papel === 'Admin'
        ? createAssinaturaDto
        : { ...createAssinaturaDto, idUsuario: atual.userId };

    return this.assinaturasService.create(dados);
  }

  @Get()
  @ApiOperation({ summary: 'Listar assinaturas' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.assinaturasService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma assinatura pelo ID' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assinaturasService.findOne(id);
  }

  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma assinatura' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssinaturaDto: UpdateAssinaturaDto,
  ) {
    return this.assinaturasService.update(id, updateAssinaturaDto);
  }

  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma assinatura' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assinaturasService.remove(id);
  }
}
