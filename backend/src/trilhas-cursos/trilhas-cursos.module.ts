import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TrilhasCursosService } from './trilhas-cursos.service';
import { TrilhasCursosController } from './trilhas-cursos.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TrilhasCursosController],
  providers: [TrilhasCursosService],
})
export class TrilhasCursosModule {}
