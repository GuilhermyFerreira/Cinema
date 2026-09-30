import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CursosModule } from './cursos/cursos.module';
import { ModulosModule } from './modulos/modulos.module';
import { AulasModule } from './aulas/aulas.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { ProgressoAulasModule } from './progresso-aulas/progresso-aulas.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { TrilhasModule } from './trilhas/trilhas.module';
import { TrilhasCursosModule } from './trilhas-cursos/trilhas-cursos.module';
import { CertificadosModule } from './certificados/certificados.module';
import { PlanosModule } from './planos/planos.module';
import { AssinaturasModule } from './assinaturas/assinaturas.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,

    // Core
    UsuariosModule,
    CategoriasModule,
    CursosModule,

    // Conteúdo
    ModulosModule,
    AulasModule,

    // Interação
    MatriculasModule,
    ProgressoAulasModule,
    AvaliacoesModule,

    // Curadoria
    TrilhasModule,
    TrilhasCursosModule,
    CertificadosModule,

    // Negócio
    PlanosModule,
    AssinaturasModule,
    PagamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
