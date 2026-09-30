import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTrilhaDto {
  @ApiProperty({
    example: 'Formação Full Stack',
    description: 'Título da trilha',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titulo!: string;

  @ApiPropertyOptional({
    example: 'Do front-end ao back-end, em sequência.',
    description: 'Descrição da trilha',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  descricao?: string | null;

  @ApiProperty({ example: 1, description: 'ID da categoria' })
  @IsInt()
  idCategoria!: number;
}
