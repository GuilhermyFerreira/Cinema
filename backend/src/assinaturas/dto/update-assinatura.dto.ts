import { PartialType } from '@nestjs/swagger';
import { CreateAssinaturaDto } from './create-assinatura.dto';

export class UpdateAssinaturaDto extends PartialType(CreateAssinaturaDto) {}
