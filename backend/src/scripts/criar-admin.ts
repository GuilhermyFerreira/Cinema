import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Cria (ou promove) um administrador.
 *
 * O autocadastro público sempre gera um Aluno — de propósito, para que ninguém
 * consiga virar Admin pela API. Então o primeiro administrador precisa ser
 * criado por fora, com este script:
 *
 *   npm run criar:admin -- "Nome Completo" email@exemplo.com senhaSegura
 *
 * Se o e-mail já existir, o usuário é apenas promovido a Admin (a senha é
 * trocada somente quando uma nova é informada).
 */
async function principal() {
  const [nome, email, senha] = process.argv.slice(2);

  if (!email) {
    console.error(
      'Uso: npm run criar:admin -- "Nome Completo" email@exemplo.com senha',
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não definida');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
      const dados: { papel: 'Admin'; senhaHash?: string } = { papel: 'Admin' };
      if (senha)
        dados.senhaHash = await bcrypt.hash(senha, await bcrypt.genSalt());

      const atualizado = await prisma.usuario.update({
        where: { email },
        data: dados,
        omit: { senhaHash: true },
      });

      console.log('Usuário promovido a Admin:', atualizado);
      return;
    }

    if (!nome || !senha) {
      console.error(
        'Para criar um usuário novo, informe nome, e-mail e senha:\n' +
          '  npm run criar:admin -- "Nome Completo" email@exemplo.com senha',
      );
      process.exit(1);
    }

    const criado = await prisma.usuario.create({
      data: {
        nomeCompleto: nome,
        email,
        senhaHash: await bcrypt.hash(senha, await bcrypt.genSalt()),
        papel: 'Admin',
      },
      omit: { senhaHash: true },
    });

    console.log('Admin criado:', criado);
  } finally {
    await prisma.$disconnect();
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
