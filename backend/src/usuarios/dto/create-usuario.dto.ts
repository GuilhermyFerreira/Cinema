import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Marina Alves Rocha',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nomeCompleto!: string;

  @ApiProperty({
    example: 'marina.rocha@eduplus.com',
    description: 'E-mail (único)',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha em texto puro; é convertida em hash antes de ser salva',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  senha!: string;
}
