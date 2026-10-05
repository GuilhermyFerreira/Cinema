import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Carrega os dados de exemplo no PostgreSQL.
 *
 * Eles viviam em `frontend/db.json`, usado pelo JSON Server enquanto o site
 * consumia aquela API. Agora que o frontend fala com esta API, os mesmos dados
 * precisam existir aqui — este script faz a travessia.
 *
 *   npm run popular
 *
 * Os identificadores do JSON ("u1", "cur3") são texto; o banco usa inteiros
 * autoincrementados. Por isso cada coleção guarda um mapa de-para, consultado
 * ao gravar as chaves estrangeiras.
 *
 * A senha de todos os usuários de exemplo vira "senha123" (como hash bcrypt),
 * já que o arquivo original guardava senhas em texto puro.
 */

interface Registro {
  id: string;
  [campo: string]: unknown;
}

const SENHA_PADRAO = 'senha123';

function lerBase(): Record<string, Registro[]> {
  const caminho = path.resolve(process.cwd(), '..', 'frontend', 'db.json');

  if (!fs.existsSync(caminho)) {
    throw new Error(`Arquivo de dados não encontrado: ${caminho}`);
  }

  return JSON.parse(fs.readFileSync(caminho, 'utf8')) as Record<
    string,
    Registro[]
  >;
}

/** Converte um campo do JSON em texto, com narrowing explícito. */
function texto(valor: unknown, padrao = ''): string {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' || typeof valor === 'boolean')
    return String(valor);
  return padrao;
}

/** Converte uma data do JSON para ISO completo, que é o que o Prisma aceita. */
function data(valor: unknown): Date | null {
  if (typeof valor !== 'string' || !valor) return null;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

async function principal() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não definida');

  const base = lerBase();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    if ((await prisma.curso.count()) > 0) {
      console.log(
        'O banco já possui cursos cadastrados. Nada foi alterado.\n' +
          'Para recarregar, esvazie as tabelas antes de rodar novamente.',
      );
      return;
    }

    const senhaHash = await bcrypt.hash(SENHA_PADRAO, await bcrypt.genSalt());

    // O arquivo de origem não tinha integridade referencial (o JSON Server não
    // impõe chaves estrangeiras), então sobraram registros apontando para itens
    // já excluídos. Eles são pulados e relatados no fim.
    const orfaos: string[] = [];

    // Mapas de-para entre o ID em texto do JSON e o ID numérico do banco.
    const usuarios = new Map<string, number>();
    const categorias = new Map<string, number>();
    const cursos = new Map<string, number>();
    const modulos = new Map<string, number>();
    const aulas = new Map<string, number>();
    const trilhas = new Map<string, number>();
    const planos = new Map<string, number>();
    const assinaturas = new Map<string, number>();

    for (const u of base.usuarios ?? []) {
      // Quem dava aula no modelo antigo vira Admin, que é quem administra o
      // catálogo; os demais entram como Aluno.
      const papel = u.perfil === 'Instrutor' ? 'Admin' : 'Aluno';
      const existente = await prisma.usuario.findUnique({
        where: { email: texto(u.email) },
      });

      const criado =
        existente ??
        (await prisma.usuario.create({
          data: {
            nomeCompleto: texto(u.nomeCompleto).trim(),
            email: texto(u.email),
            senhaHash,
            dataCadastro: data(u.dataCadastro) ?? new Date(),
            papel,
          },
        }));

      usuarios.set(u.id, criado.idUsuario);
    }

    for (const c of base.categorias ?? []) {
      const criada = await prisma.categoria.create({
        data: { nome: texto(c.nome), descricao: texto(c.descricao, '') },
      });
      categorias.set(c.id, criada.idCategoria);
    }

    for (const c of base.cursos ?? []) {
      const criado = await prisma.curso.create({
        data: {
          titulo: texto(c.titulo),
          descricao: texto(c.descricao, ''),
          idInstrutor: usuarios.get(texto(c.idInstrutor))!,
          idCategoria: categorias.get(texto(c.idCategoria))!,
          nivel: texto(c.nivel, 'Iniciante'),
          dataPublicacao: data(c.dataPublicacao),
          totalAulas: Number(c.totalAulas ?? 0),
          totalHoras: Number(c.totalHoras ?? 0),
        },
      });
      cursos.set(c.id, criado.idCurso);
    }

    for (const m of base.modulos ?? []) {
      const idCurso = cursos.get(texto(m.idCurso));
      if (!idCurso) {
        orfaos.push(`módulo ${m.id} → curso ${texto(m.idCurso)} inexistente`);
        continue;
      }

      const criado = await prisma.modulo.create({
        data: {
          idCurso,
          titulo: texto(m.titulo),
          ordem: Number(m.ordem),
        },
      });
      modulos.set(m.id, criado.idModulo);
    }

    for (const a of base.aulas ?? []) {
      const idModulo = modulos.get(texto(a.idModulo));
      if (!idModulo) {
        orfaos.push(`aula ${a.id} → módulo ${texto(a.idModulo)} inexistente`);
        continue;
      }

      const criada = await prisma.aula.create({
        data: {
          idModulo,
          titulo: texto(a.titulo),
          tipoConteudo: texto(a.tipoConteudo),
          urlConteudo: texto(a.urlConteudo, ''),
          duracaoMinutos: Number(a.duracaoMinutos ?? 0),
          ordem: Number(a.ordem),
        },
      });
      aulas.set(a.id, criada.idAula);
    }

    for (const m of base.matriculas ?? []) {
      const idUsuario = usuarios.get(texto(m.idUsuario));
      const idCurso = cursos.get(texto(m.idCurso));
      if (!idUsuario || !idCurso) {
        orfaos.push(`matrícula ${m.id} → usuário ou curso inexistente`);
        continue;
      }

      await prisma.matricula.create({
        data: {
          idUsuario,
          idCurso,
          dataMatricula: data(m.dataMatricula) ?? new Date(),
          dataConclusao: data(m.dataConclusao),
        },
      });
    }

    for (const p of base.progressoAulas ?? []) {
      const idUsuario = usuarios.get(texto(p.idUsuario));
      const idAula = aulas.get(texto(p.idAula));
      if (!idUsuario || !idAula) continue; // registro órfão no arquivo

      await prisma.progressoAula.create({
        data: {
          idUsuario,
          idAula,
          dataConclusao: data(p.dataConclusao) ?? new Date(),
          status: texto(p.status),
        },
      });
    }

    for (const a of base.avaliacoes ?? []) {
      const idUsuario = usuarios.get(texto(a.idUsuario));
      const idCurso = cursos.get(texto(a.idCurso));
      if (!idUsuario || !idCurso) {
        orfaos.push(`avaliação ${a.id} → usuário ou curso inexistente`);
        continue;
      }

      await prisma.avaliacao.create({
        data: {
          idUsuario,
          idCurso,
          nota: Number(a.nota),
          comentario: a.comentario ? texto(a.comentario) : null,
          dataAvaliacao: data(a.dataAvaliacao) ?? new Date(),
        },
      });
    }

    for (const t of base.trilhas ?? []) {
      const criada = await prisma.trilha.create({
        data: {
          titulo: texto(t.titulo),
          descricao: texto(t.descricao, ''),
          idCategoria: categorias.get(texto(t.idCategoria))!,
        },
      });
      trilhas.set(t.id, criada.idTrilha);
    }

    for (const tc of base.trilhasCursos ?? []) {
      const idTrilha = trilhas.get(texto(tc.idTrilha));
      const idCurso = cursos.get(texto(tc.idCurso));
      if (!idTrilha || !idCurso) {
        orfaos.push(`trilha/curso ${tc.id} → trilha ou curso inexistente`);
        continue;
      }

      await prisma.trilhaCurso.create({
        data: {
          idTrilha,
          idCurso,
          ordem: Number(tc.ordem),
        },
      });
    }

    for (const c of base.certificados ?? []) {
      const idUsuario = usuarios.get(texto(c.idUsuario));
      const idCurso = cursos.get(texto(c.idCurso));
      if (!idUsuario || !idCurso) {
        orfaos.push(`certificado ${c.id} → usuário ou curso inexistente`);
        continue;
      }

      await prisma.certificado.create({
        data: {
          idUsuario,
          idCurso,
          idTrilha: c.idTrilha
            ? (trilhas.get(texto(c.idTrilha)) ?? null)
            : null,
          codigoVerificacao: texto(c.codigoVerificacao),
          dataEmissao: data(c.dataEmissao) ?? new Date(),
        },
      });
    }

    for (const p of base.planos ?? []) {
      const criado = await prisma.plano.create({
        data: {
          nome: texto(p.nome),
          descricao: texto(p.descricao, ''),
          preco: Number(p.preco),
          duracaoMeses: Number(p.duracaoMeses),
        },
      });
      planos.set(p.id, criado.idPlano);
    }

    for (const a of base.assinaturas ?? []) {
      const idUsuario = usuarios.get(texto(a.idUsuario));
      const idPlano = planos.get(texto(a.idPlano));
      if (!idUsuario || !idPlano) {
        orfaos.push(`assinatura ${a.id} → usuário ou plano inexistente`);
        continue;
      }

      const criada = await prisma.assinatura.create({
        data: {
          idUsuario,
          idPlano,
          dataInicio: data(a.dataInicio) ?? new Date(),
          dataFim: data(a.dataFim) ?? new Date(),
        },
      });
      assinaturas.set(a.id, criada.idAssinatura);
    }

    for (const p of base.pagamentos ?? []) {
      const idAssinatura = assinaturas.get(texto(p.idAssinatura));
      if (!idAssinatura) continue;

      await prisma.pagamento.create({
        data: {
          idAssinatura,
          valorPago: Number(p.valorPago),
          dataPagamento: data(p.dataPagamento) ?? new Date(),
          metodoPagamento: texto(p.metodoPagamento),
          idTransacaoGateway: texto(p.idTransacaoGateway),
        },
      });
    }

    const contagens = {
      usuarios: await prisma.usuario.count(),
      categorias: await prisma.categoria.count(),
      cursos: await prisma.curso.count(),
      modulos: await prisma.modulo.count(),
      aulas: await prisma.aula.count(),
      matriculas: await prisma.matricula.count(),
      progressoAulas: await prisma.progressoAula.count(),
      avaliacoes: await prisma.avaliacao.count(),
      trilhas: await prisma.trilha.count(),
      trilhasCursos: await prisma.trilhaCurso.count(),
      certificados: await prisma.certificado.count(),
      planos: await prisma.plano.count(),
      assinaturas: await prisma.assinatura.count(),
      pagamentos: await prisma.pagamento.count(),
    };

    console.log('Dados de exemplo carregados:');
    for (const [tabela, total] of Object.entries(contagens)) {
      console.log(`  ${tabela.padEnd(16)} ${total}`);
    }
    console.log(`\nSenha de todos os usuários de exemplo: ${SENHA_PADRAO}`);

    if (orfaos.length) {
      console.log(
        `\n${orfaos.length} registro(s) do arquivo foram ignorados por apontarem ` +
          'para itens inexistentes:',
      );
      for (const o of orfaos) console.log(`  - ${o}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
