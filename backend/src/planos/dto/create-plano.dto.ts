import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePlanoDto {
  @ApiProperty({ example: 'Anual', description: 'Nome do plano' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nome!: string;

  @ApiPropertyOptional({
    example: 'Doze meses de acesso completo e mentorias mensais.',
    description: 'Descrição do plano',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  descricao?: string | null;

  @ApiProperty({ example: 429.9, description: 'Preço total do plano' })
  @IsNumber()
  @Min(0)
  preco!: number;

  @ApiProperty({ example: 12, description: 'Duração em meses' })
  @IsInt()
  @Min(1)
  duracaoMeses!: number;
}
