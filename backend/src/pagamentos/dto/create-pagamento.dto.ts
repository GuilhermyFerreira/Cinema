import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DataIso } from '../../comum/data-iso.decorator';

export class CreatePagamentoDto {
  @ApiProperty({ example: 1, description: 'ID da assinatura paga' })
  @IsInt()
  idAssinatura!: number;

  @ApiProperty({ example: 429.9, description: 'Valor efetivamente pago' })
  @IsNumber()
  @Min(0)
  valorPago!: number;

  @ApiPropertyOptional({
    example: '2026-03-15',
    description: 'Data do pagamento (padrão: agora)',
  })
  @IsOptional()
  @DataIso()
  dataPagamento?: string;

  @ApiProperty({
    example: 'Pix',
    description: 'Método: Cartão de Crédito, Pix, Boleto...',
  })
  @IsString()
  @IsNotEmpty()
  metodoPagamento!: string;

  @ApiProperty({
    example: 'TRX-1773561600-A1B2C3',
    description: 'ID da transação no gateway',
  })
  @IsString()
  @IsNotEmpty()
  idTransacaoGateway!: string;
}
