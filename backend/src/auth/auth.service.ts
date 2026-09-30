import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

/** Conteúdo "útil" carregado dentro do token. */
export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Busca o usuário pelo e-mail
    const usuario = await this.usuariosService.findByEmail(loginDto.email);

    // Compara a senha digitada com o hash salvo no banco.
    // A mesma mensagem é usada nos dois casos para não revelar
    // se o e-mail existe no sistema.
    if (
      !usuario ||
      !(await bcrypt.compare(loginDto.senha, usuario.senhaHash))
    ) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // Define o conteúdo do token
    const payload: JwtPayload = {
      sub: usuario.idUsuario,
      email: usuario.email,
    };

    return {
      access_token: this.jwtService.sign(payload), // Gera o JWT assinado
      usuario: {
        idUsuario: usuario.idUsuario,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
      },
    };
  }
}
