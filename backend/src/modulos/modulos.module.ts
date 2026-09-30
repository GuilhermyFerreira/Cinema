import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ModulosService } from './modulos.service';
import { ModulosController } from './modulos.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ModulosController],
  providers: [ModulosService],
})
export class ModulosModule {}
