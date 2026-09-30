import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreateProgressoAulaDto {
  @ApiProperty({ example: 1, description: 'ID do aluno' })
  @IsInt()
  idUsuario!: number;

  @ApiProperty({ example: 1, description: 'ID da aula' })
  @IsInt()
  idAula!: number;

  @ApiProperty({
    example: '2026-03-16',
    description: 'Data de conclusão da aula',
  })
  @DataIso()
  dataConclusao!: string;

  @ApiProperty({
    example: 'Concluído',
    description: 'Status: Em Andamento ou Concluído',
  })
  @IsString()
  @IsNotEmpty()
  status!: string;
}
