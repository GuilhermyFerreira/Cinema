import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTrilhaCursoDto } from './create-trilha-curso.dto';

// A chave composta (idTrilha + idCurso) identifica o vínculo; só a ordem muda.
export class UpdateTrilhaCursoDto extends PartialType(
  OmitType(CreateTrilhaCursoDto, ['idTrilha', 'idCurso'] as const),
) {}
