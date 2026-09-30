import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TrilhasService } from './trilhas.service';
import { TrilhasController } from './trilhas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TrilhasController],
  providers: [TrilhasService],
})
export class TrilhasModule {}
