import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreateMatriculaDto {
  @ApiProperty({ example: 1, description: 'ID do aluno' })
  @IsInt()
  idUsuario!: number;

  @ApiProperty({ example: 1, description: 'ID do curso' })
  @IsInt()
  idCurso!: number;

  @ApiPropertyOptional({
    example: '2026-03-15',
    description: 'Data da matrícula (padrão: agora)',
  })
  @IsOptional()
  @DataIso()
  dataMatricula?: string;

  @ApiPropertyOptional({
    example: '2026-05-20',
    description: 'Data de conclusão; null enquanto em andamento',
    nullable: true,
  })
  @IsOptional()
  @DataIso()
  dataConclusao?: string | null;
}
