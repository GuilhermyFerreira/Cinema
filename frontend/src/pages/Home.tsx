import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  usuarioService,
  cursoService,
  categoriaService,
  trilhaService,
  matriculaService,
  certificadoService,
  assinaturaService,
  pagamentoService,
} from '../services';
import { Carregando } from '../components/UI/Carregando';
import { formatarMoeda } from '../utils/formatadores';

interface Indicadores {
  usuarios: number;
  cursos: number;
  categorias: number;
  trilhas: number;
  matriculas: number;
  certificados: number;
  assinaturas: number;
  faturamento: number;
}

interface AtalhoModulo {
  titulo: string;
  descricao: string;
  link: string;
  icone: string;
  cor: string;
}

const MODULOS: AtalhoModulo[] = [
  {
    titulo: 'Acadêmico e Conteúdo',
    descricao:
      'Cadastre categorias, cursos e trilhas, e monte a estrutura de módulos e aulas.',
    link: '/cursos',
    icone: 'bi-journals',
    cor: 'primary',
  },
  {
    titulo: 'Usuário e Progresso',
    descricao:
      'Registre alunos e instrutores, matricule em cursos e acompanhe a conclusão das aulas.',
    link: '/matriculas',
    icone: 'bi-person-workspace',
    cor: 'success',
  },
  {
    titulo: 'Financeiro',
    descricao:
      'Gerencie planos, assine com checkout simulado e consulte os pagamentos.',
    link: '/checkout',
    icone: 'bi-wallet2',
    cor: 'warning',
  },
];

/** Painel inicial com os indicadores gerais e os atalhos dos três módulos. */
export function Home() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarIndicadores();
  }, []);

  async function carregarIndicadores() {
    try {
      const [
        usuarios,
        cursos,
        categorias,
        trilhas,
        matriculas,
        certificados,
        assinaturas,
        faturamento,
      ] = await Promise.all([
        usuarioService.listar(),
        cursoService.listar(),
        categoriaService.listar(),
        trilhaService.listar(),
        matriculaService.listar(),
        certificadoService.listar(),
        assinaturaService.listar(),
        pagamentoService.totalFaturado(),
      ]);

      setIndicadores({
        usuarios: usuarios.length,
        cursos: cursos.length,
        categorias: categorias.length,
        trilhas: trilhas.length,
        matriculas: matriculas.length,
        certificados: certificados.length,
        assinaturas: assinaturas.length,
        faturamento,
      });
    } catch (erro) {
      console.error('Erro ao carregar indicadores:', erro);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <section className="p-4 p-md-5 mb-5 rounded-3 bg-body-tertiary border">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h1 className="display-5 fw-bold mb-3">
              <i className="bi bi-mortarboard-fill text-primary me-3"></i>
              EduPlus
            </h1>
            <p className="lead text-body-secondary mb-4">
              Plataforma de cursos online para gerenciar o ciclo acadêmico e
              financeiro de alunos e instrutores — da hierarquia de conteúdo
              (cursos, módulos e aulas) até assinaturas e pagamentos.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/cursos" className="btn btn-primary btn-lg">
                <i className="bi bi-journal-code me-2"></i>Ver catálogo
              </Link>
              <Link to="/checkout" className="btn btn-outline-primary btn-lg">
                <i className="bi bi-bag-check me-2"></i>Assinar um plano
              </Link>
            </div>
          </div>
        </div>
      </section>

      {carregando ? (
        <Carregando mensagem="Carregando indicadores da plataforma..." />
      ) : indicadores ? (
        <section className="mb-5">
          <h4 className="mb-3">Visão geral</h4>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            <Indicador
              rotulo="Usuários"
              valor={indicadores.usuarios}
              icone="bi-people-fill"
              cor="primary"
              link="/usuarios"
            />
            <Indicador
              rotulo="Cursos"
              valor={indicadores.cursos}
              icone="bi-journal-code"
              cor="info"
              link="/cursos"
            />
            <Indicador
              rotulo="Categorias"
              valor={indicadores.categorias}
              icone="bi-tags-fill"
              cor="secondary"
              link="/categorias"
            />
            <Indicador
              rotulo="Trilhas"
              valor={indicadores.trilhas}
              icone="bi-signpost-split-fill"
              cor="secondary"
              link="/trilhas"
            />
            <Indicador
              rotulo="Matrículas"
              valor={indicadores.matriculas}
              icone="bi-card-checklist"
              cor="success"
              link="/matriculas"
            />
            <Indicador
              rotulo="Certificados"
              valor={indicadores.certificados}
              icone="bi-patch-check-fill"
              cor="success"
              link="/certificados"
            />
            <Indicador
              rotulo="Assinaturas"
              valor={indicadores.assinaturas}
              icone="bi-arrow-repeat"
              cor="warning"
              link="/assinaturas"
            />
            <Indicador
              rotulo="Faturamento"
              valor={formatarMoeda(indicadores.faturamento)}
              icone="bi-cash-coin"
              cor="warning"
              link="/pagamentos"
            />
          </div>
        </section>
      ) : null}

      <section>
        <h4 className="mb-3">Módulos do sistema</h4>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {MODULOS.map((modulo) => (
            <div className="col" key={modulo.titulo}>
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body">
                  <i
                    className={`bi ${modulo.icone} display-4 text-${modulo.cor} d-block mb-3`}
                  ></i>
                  <h5 className="card-title">{modulo.titulo}</h5>
                  <p className="card-text text-body-secondary small">
                    {modulo.descricao}
                  </p>
                  <Link
                    to={modulo.link}
                    className={`btn btn-outline-${modulo.cor} stretched-link`}
                  >
                    Acessar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface IndicadorProps {
  rotulo: string;
  valor: number | string;
  icone: string;
  cor: string;
  link: string;
}

function Indicador({ rotulo, valor, icone, cor, link }: IndicadorProps) {
  return (
    <div className="col">
      <Link to={link} className="text-decoration-none">
        <div className="card h-100 shadow-sm">
          <div className="card-body d-flex align-items-center gap-3">
            <i className={`bi ${icone} fs-2 text-${cor}`}></i>
            <div>
              <div className="fs-4 fw-bold">{valor}</div>
              <div className="small text-body-secondary">{rotulo}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
