import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({
    example: 'Desenvolvimento Web',
    description: 'Nome da categoria (único)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nome!: string;

  @ApiPropertyOptional({
    example: 'Construção de aplicações para a web, do front-end ao back-end.',
    description: 'Descrição da categoria',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  descricao?: string | null;
}
