import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssinaturasService } from './assinaturas.service';
import { AssinaturasController } from './assinaturas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AssinaturasController],
  providers: [AssinaturasService],
})
export class AssinaturasModule {}
