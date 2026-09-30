import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreateCursoDto {
  @ApiProperty({
    example: 'React com TypeScript do Zero',
    description: 'Título do curso',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titulo!: string;

  @ApiPropertyOptional({
    example: 'Componentes, hooks, rotas e consumo de APIs.',
    description: 'Descrição do curso',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  descricao?: string | null;

  @ApiProperty({ example: 1, description: 'ID do usuário instrutor' })
  @IsInt()
  idInstrutor!: number;

  @ApiProperty({ example: 1, description: 'ID da categoria' })
  @IsInt()
  idCategoria!: number;

  @ApiPropertyOptional({
    example: 'Iniciante',
    description: 'Nível: Iniciante, Intermediário ou Avançado',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  nivel?: string | null;

  @ApiPropertyOptional({
    example: '2026-03-10',
    description: 'Data de publicação',
    nullable: true,
  })
  @IsOptional()
  @DataIso()
  dataPublicacao?: string | null;

  @ApiPropertyOptional({
    example: 6,
    description: 'Total de aulas declarado',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalAulas?: number | null;

  @ApiPropertyOptional({
    example: 20,
    description: 'Carga horária em horas',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalHoras?: number | null;
}
