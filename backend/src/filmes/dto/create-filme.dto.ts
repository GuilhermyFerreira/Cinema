import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateFilmeDto {
  @ApiProperty({ example: 'Duna: Parte Dois', description: 'Título do filme' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Paul Atreides se une a Chani...', description: 'Sinopse do filme', minLength: 10 })
  @IsString()
  @MinLength(10)
  sinopse: string;

  @ApiProperty({ example: 166, description: 'Duração em minutos' })
  @IsInt()
  @Min(1)
  duracao: number;

  @ApiProperty({ example: '14 anos', description: 'Classificação indicativa' })
  @IsString()
  @IsNotEmpty()
  classificacao: string;

  @ApiProperty({ example: 'Ficção Científica', description: 'Gênero do filme' })
  @IsString()
  @IsNotEmpty()
  genero: string;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z', description: 'Data inicial de exibição' })
  @IsDateString()
  dataInicialExibicao: string;

  @ApiProperty({ example: '2026-10-01T00:00:00.000Z', description: 'Data final de exibição' })
  @IsDateString()
  dataFinalExibicao: string;
}
