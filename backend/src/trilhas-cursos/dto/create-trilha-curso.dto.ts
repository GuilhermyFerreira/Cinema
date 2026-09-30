import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateTrilhaCursoDto {
  @ApiProperty({ example: 1, description: 'ID da trilha' })
  @IsInt()
  idTrilha!: number;

  @ApiProperty({ example: 1, description: 'ID do curso que compõe a trilha' })
  @IsInt()
  idCurso!: number;

  @ApiProperty({
    example: 1,
    description: 'Sequência do curso dentro da trilha',
  })
  @IsInt()
  @Min(1)
  ordem!: number;
}
