import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}
