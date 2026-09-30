import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsDateString } from 'class-validator';

/**
 * Valida uma data e a normaliza para ISO-8601 completo.
 *
 * O Prisma recusa datas sem hora ("premature end of input"), mas formulários
 * HTML (`<input type="date">`) enviam exatamente esse formato. O Transform roda
 * antes da validação, então "2026-03-10" chega ao banco como
 * "2026-03-10T00:00:00.000Z". Valores inválidos passam intactos e são barrados
 * pelo IsDateString, devolvendo 400 em vez de 500.
 */
export function DataIso() {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => {
      if (typeof value !== 'string' || value.trim() === '') return value;
      const data = new Date(value);
      return isNaN(data.getTime()) ? value : data.toISOString();
    }),
    IsDateString(),
  );
}
