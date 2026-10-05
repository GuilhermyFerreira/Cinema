-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('Admin', 'Aluno');

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "Papel" "Papel" NOT NULL DEFAULT 'Aluno';
