/*
  Warnings:

  - You are about to drop the `Filme` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Filme";

-- CreateTable
CREATE TABLE "Usuarios" (
    "ID_Usuario" SERIAL NOT NULL,
    "NomeCompleto" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "SenhaHash" TEXT NOT NULL,
    "DataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("ID_Usuario")
);

-- CreateTable
CREATE TABLE "Categorias" (
    "ID_Categoria" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT,

    CONSTRAINT "Categorias_pkey" PRIMARY KEY ("ID_Categoria")
);

-- CreateTable
CREATE TABLE "Cursos" (
    "ID_Curso" SERIAL NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT,
    "ID_Instrutor" INTEGER NOT NULL,
    "ID_Categoria" INTEGER NOT NULL,
    "Nivel" TEXT,
    "DataPublicacao" TIMESTAMP(3),
    "TotalAulas" INTEGER,
    "TotalHoras" INTEGER,

    CONSTRAINT "Cursos_pkey" PRIMARY KEY ("ID_Curso")
);

-- CreateTable
CREATE TABLE "Modulos" (
    "ID_Modulo" SERIAL NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Ordem" INTEGER NOT NULL,

    CONSTRAINT "Modulos_pkey" PRIMARY KEY ("ID_Modulo")
);

-- CreateTable
CREATE TABLE "Aulas" (
    "ID_Aula" SERIAL NOT NULL,
    "ID_Modulo" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "TipoConteudo" TEXT NOT NULL,
    "URL_Conteudo" TEXT,
    "DuracaoMinutos" INTEGER,
    "Ordem" INTEGER NOT NULL,

    CONSTRAINT "Aulas_pkey" PRIMARY KEY ("ID_Aula")
);

-- CreateTable
CREATE TABLE "Matriculas" (
    "ID_Matricula" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "DataMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataConclusao" TIMESTAMP(3),

    CONSTRAINT "Matriculas_pkey" PRIMARY KEY ("ID_Matricula")
);

-- CreateTable
CREATE TABLE "Progresso_Aulas" (
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Aula" INTEGER NOT NULL,
    "DataConclusao" TIMESTAMP(3) NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Progresso_Aulas_pkey" PRIMARY KEY ("ID_Usuario","ID_Aula")
);

-- CreateTable
CREATE TABLE "Avaliacoes" (
    "ID_Avaliacao" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Nota" INTEGER NOT NULL,
    "Comentario" TEXT,
    "DataAvaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacoes_pkey" PRIMARY KEY ("ID_Avaliacao")
);

-- CreateTable
CREATE TABLE "Trilhas" (
    "ID_Trilha" SERIAL NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT,
    "ID_Categoria" INTEGER NOT NULL,

    CONSTRAINT "Trilhas_pkey" PRIMARY KEY ("ID_Trilha")
);

-- CreateTable
CREATE TABLE "Trilhas_Cursos" (
    "ID_Trilha" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Ordem" INTEGER NOT NULL,

    CONSTRAINT "Trilhas_Cursos_pkey" PRIMARY KEY ("ID_Trilha","ID_Curso")
);

-- CreateTable
CREATE TABLE "Certificados" (
    "ID_Certificado" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "ID_Trilha" INTEGER,
    "CodigoVerificacao" TEXT NOT NULL,
    "DataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificados_pkey" PRIMARY KEY ("ID_Certificado")
);

-- CreateTable
CREATE TABLE "Planos" (
    "ID_Plano" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT,
    "Preco" DECIMAL(65,30) NOT NULL,
    "DuracaoMeses" INTEGER NOT NULL,

    CONSTRAINT "Planos_pkey" PRIMARY KEY ("ID_Plano")
);

-- CreateTable
CREATE TABLE "Assinaturas" (
    "ID_Assinatura" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Plano" INTEGER NOT NULL,
    "DataInicio" TIMESTAMP(3) NOT NULL,
    "DataFim" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assinaturas_pkey" PRIMARY KEY ("ID_Assinatura")
);

-- CreateTable
CREATE TABLE "Pagamentos" (
    "ID_Pagamento" SERIAL NOT NULL,
    "ID_Assinatura" INTEGER NOT NULL,
    "ValorPago" DECIMAL(65,30) NOT NULL,
    "DataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MetodoPagamento" TEXT NOT NULL,
    "Id_Transacao_Gateway" TEXT NOT NULL,

    CONSTRAINT "Pagamentos_pkey" PRIMARY KEY ("ID_Pagamento")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_Email_key" ON "Usuarios"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Categorias_Nome_key" ON "Categorias"("Nome");

-- CreateIndex
CREATE UNIQUE INDEX "Certificados_CodigoVerificacao_key" ON "Certificados"("CodigoVerificacao");

-- AddForeignKey
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_ID_Instrutor_fkey" FOREIGN KEY ("ID_Instrutor") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_ID_Categoria_fkey" FOREIGN KEY ("ID_Categoria") REFERENCES "Categorias"("ID_Categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modulos" ADD CONSTRAINT "Modulos_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aulas" ADD CONSTRAINT "Aulas_ID_Modulo_fkey" FOREIGN KEY ("ID_Modulo") REFERENCES "Modulos"("ID_Modulo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matriculas" ADD CONSTRAINT "Matriculas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matriculas" ADD CONSTRAINT "Matriculas_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso_Aulas" ADD CONSTRAINT "Progresso_Aulas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso_Aulas" ADD CONSTRAINT "Progresso_Aulas_ID_Aula_fkey" FOREIGN KEY ("ID_Aula") REFERENCES "Aulas"("ID_Aula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacoes" ADD CONSTRAINT "Avaliacoes_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacoes" ADD CONSTRAINT "Avaliacoes_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trilhas" ADD CONSTRAINT "Trilhas_ID_Categoria_fkey" FOREIGN KEY ("ID_Categoria") REFERENCES "Categorias"("ID_Categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trilhas_Cursos" ADD CONSTRAINT "Trilhas_Cursos_ID_Trilha_fkey" FOREIGN KEY ("ID_Trilha") REFERENCES "Trilhas"("ID_Trilha") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trilhas_Cursos" ADD CONSTRAINT "Trilhas_Cursos_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_ID_Trilha_fkey" FOREIGN KEY ("ID_Trilha") REFERENCES "Trilhas"("ID_Trilha") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinaturas" ADD CONSTRAINT "Assinaturas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinaturas" ADD CONSTRAINT "Assinaturas_ID_Plano_fkey" FOREIGN KEY ("ID_Plano") REFERENCES "Planos"("ID_Plano") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamentos" ADD CONSTRAINT "Pagamentos_ID_Assinatura_fkey" FOREIGN KEY ("ID_Assinatura") REFERENCES "Assinaturas"("ID_Assinatura") ON DELETE RESTRICT ON UPDATE CASCADE;
