import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreateAvaliacaoDto {
  @ApiProperty({ example: 1, description: 'ID do aluno que avaliou' })
  @IsInt()
  idUsuario!: number;

  @ApiProperty({ example: 1, description: 'ID do curso avaliado' })
  @IsInt()
  idCurso!: number;

  @ApiProperty({ example: 5, description: 'Nota de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  nota!: number;

  @ApiPropertyOptional({
    example: 'Didática excelente e projeto final próximo do mercado.',
    description: 'Comentário opcional',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  comentario?: string | null;

  @ApiPropertyOptional({
    example: '2026-05-21',
    description: 'Data da avaliação (padrão: agora)',
  })
  @IsOptional()
  @DataIso()
  dataAvaliacao?: string;
}
