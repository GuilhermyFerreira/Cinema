import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FilmesModule } from './filmes/filmes.module';

@Module({
  imports: [PrismaModule, FilmesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
