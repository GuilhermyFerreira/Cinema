import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreateAssinaturaDto {
  @ApiProperty({ example: 1, description: 'ID do assinante' })
  @IsInt()
  idUsuario!: number;

  @ApiProperty({ example: 1, description: 'ID do plano contratado' })
  @IsInt()
  idPlano!: number;

  @ApiProperty({ example: '2026-03-15', description: 'Início da vigência' })
  @DataIso()
  dataInicio!: string;

  @ApiProperty({ example: '2027-03-15', description: 'Fim da vigência' })
  @DataIso()
  dataFim!: string;
}
