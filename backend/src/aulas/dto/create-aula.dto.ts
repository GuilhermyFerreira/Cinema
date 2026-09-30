import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAulaDto {
  @ApiProperty({
    example: 1,
    description: 'ID do módulo ao qual a aula pertence',
  })
  @IsInt()
  idModulo!: number;

  @ApiProperty({
    example: 'Configurando o ambiente com Vite',
    description: 'Título da aula',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titulo!: string;

  @ApiProperty({
    example: 'Vídeo',
    description: 'Tipo de conteúdo: Vídeo, Texto ou Quiz',
  })
  @IsString()
  @IsNotEmpty()
  tipoConteudo!: string;

  @ApiPropertyOptional({
    example: 'https://eduplus.com/aulas/react-vite',
    description: 'URL do conteúdo',
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  urlConteudo?: string | null;

  @ApiPropertyOptional({
    example: 22,
    description: 'Duração da aula em minutos',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracaoMinutos?: number | null;

  @ApiProperty({
    example: 1,
    description: 'Sequência da aula dentro do módulo',
  })
  @IsInt()
  @Min(1)
  ordem!: number;
}
