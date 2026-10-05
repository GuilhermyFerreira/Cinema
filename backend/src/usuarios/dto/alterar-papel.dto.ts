import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { Papel } from '../../generated/prisma/enums';

/**
 * A troca de papel fica fora do CreateUsuarioDto e do UpdateUsuarioDto de
 * propósito: o autocadastro é público, então aceitar `papel` ali permitiria
 * que qualquer visitante criasse um administrador.
 */
export class AlterarPapelDto {
  @ApiProperty({
    enum: Object.values(Papel),
    example: Papel.Admin,
    description: 'Novo papel do usuário',
  })
  @IsIn(Object.values(Papel))
  papel!: Papel;
}
