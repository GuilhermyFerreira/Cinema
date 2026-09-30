import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatriculasService } from './matriculas.service';
import { MatriculasController } from './matriculas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MatriculasController],
  providers: [MatriculasService],
})
export class MatriculasModule {}
