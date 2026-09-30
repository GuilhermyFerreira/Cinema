import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AulasService } from './aulas.service';
import { AulasController } from './aulas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AulasController],
  providers: [AulasService],
})
export class AulasModule {}
