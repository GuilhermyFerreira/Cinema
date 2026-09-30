import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProgressoAulaDto } from './create-progresso-aula.dto';

// A chave composta (idUsuario + idAula) identifica o registro e não pode ser
// alterada; só o progresso em si é atualizável.
export class UpdateProgressoAulaDto extends PartialType(
  OmitType(CreateProgressoAulaDto, ['idUsuario', 'idAula'] as const),
) {}
