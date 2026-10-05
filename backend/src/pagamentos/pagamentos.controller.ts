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
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

// Todas as rotas exigem token JWT.
@ApiTags('pagamentos')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), PapeisGuard)
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou referência inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  create(
    @Body() createPagamentoDto: CreatePagamentoDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ) {
    return this.pagamentosService.create(createPagamentoDto, atual);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.pagamentosService.findAll(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagamentosService.findOne(id);
  }

  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um pagamento' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagamentoDto: UpdatePagamentoDto,
  ) {
    return this.pagamentosService.update(id, updatePagamentoDto);
  }

  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pagamento' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagamentosService.remove(id);
  }
}
