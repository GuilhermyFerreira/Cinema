import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateModuloDto {
  @ApiProperty({
    example: 1,
    description: 'ID do curso ao qual o módulo pertence',
  })
  @IsInt()
  idCurso!: number;

  @ApiProperty({
    example: 'Fundamentos do React',
    description: 'Título do módulo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titulo!: string;

  @ApiProperty({
    example: 1,
    description: 'Sequência do módulo dentro do curso',
  })
  @IsInt()
  @Min(1)
  ordem!: number;
}
