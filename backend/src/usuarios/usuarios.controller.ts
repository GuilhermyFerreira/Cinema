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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AlterarPapelDto } from './dto/alterar-papel.dto';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Rota pública: permite o cadastro de novos usuários.
  // O guard é aplicado por rota (e não na classe) justamente para que o
  // primeiro cadastro não exija um token que ainda não existe.
  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário (rota pública)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // Rotas protegidas: exigem o token JWT
  @ApiBearerAuth('token') // Configura o Swagger para enviar o Token JWT
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(@Query() filtro: Record<string, string>) {
    return this.usuariosService.findAll(filtro);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuário' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), PapeisGuard)
  @Papeis('Admin')
  @Patch(':id/papel')
  @ApiOperation({ summary: 'Promover ou rebaixar um usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Papel alterado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Exige papel Admin.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  alterarPapel(
    @Param('id', ParseIntPipe) id: number,
    @Body() alterarPapelDto: AlterarPapelDto,
  ) {
    return this.usuariosService.alterarPapel(id, alterarPapelDto.papel);
  }
}
