import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreateCertificadoDto {
  @ApiProperty({ example: 1, description: 'ID do aluno' })
  @IsInt()
  idUsuario!: number;

  @ApiProperty({ example: 1, description: 'ID do curso concluído' })
  @IsInt()
  idCurso!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da trilha, quando o curso faz parte de uma',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  idTrilha?: number | null;

  @ApiProperty({
    example: 'CERT-9F3K-2XQ7',
    description: 'Código único de verificação',
  })
  @IsString()
  @IsNotEmpty()
  codigoVerificacao!: string;

  @ApiPropertyOptional({
    example: '2026-05-20',
    description: 'Data de emissão (padrão: agora)',
  })
  @IsOptional()
  @DataIso()
  dataEmissao?: string;
}
