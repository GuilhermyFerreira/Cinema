import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuSuspenso, type ItemMenu } from './MenuSuspenso';

const MENU_ACADEMICO: ItemMenu[] = [
  { rotulo: 'Categorias', caminho: '/categorias', icone: 'bi-tags' },
  { rotulo: 'Cursos', caminho: '/cursos', icone: 'bi-journal-code' },
  { rotulo: 'Trilhas', caminho: '/trilhas', icone: 'bi-signpost-split' },
];

const MENU_ALUNOS: ItemMenu[] = [
  { rotulo: 'Usuários', caminho: '/usuarios', icone: 'bi-people' },
  { rotulo: 'Matrículas', caminho: '/matriculas', icone: 'bi-card-checklist' },
  { rotulo: 'Progresso', caminho: '/progresso', icone: 'bi-graph-up-arrow' },
  { rotulo: 'Avaliações', caminho: '/avaliacoes', icone: 'bi-star' },
  { rotulo: 'Certificados', caminho: '/certificados', icone: 'bi-patch-check' },
];

const MENU_FINANCEIRO: ItemMenu[] = [
  { rotulo: 'Planos', caminho: '/planos', icone: 'bi-box-seam' },
  { rotulo: 'Assinaturas', caminho: '/assinaturas', icone: 'bi-arrow-repeat' },
  { rotulo: 'Pagamentos', caminho: '/pagamentos', icone: 'bi-cash-coin' },
];

/** Navbar responsiva com os três módulos do sistema agrupados em dropdowns. */
export function Navbar() {
  const [expandida, setExpandida] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom shadow-sm sticky-top mb-4">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center fw-bold"
          to="/"
          onClick={() => setExpandida(false)}
        >
          <i className="bi bi-mortarboard-fill me-2 text-primary fs-4"></i>
          EduPlus
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={expandida}
          aria-label="Alternar navegação"
          onClick={() => setExpandida((estado) => !estado)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${expandida ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === '/' ? 'active fw-semibold' : ''}`}
                to="/"
              >
                <i className="bi bi-house-door me-1"></i>
                Início
              </Link>
            </li>

            <MenuSuspenso
              titulo="Acadêmico"
              icone="bi-journals"
              itens={MENU_ACADEMICO}
            />
            <MenuSuspenso
              titulo="Alunos"
              icone="bi-person-workspace"
              itens={MENU_ALUNOS}
            />
            <MenuSuspenso
              titulo="Financeiro"
              icone="bi-wallet2"
              itens={MENU_FINANCEIRO}
            />

            <li className="nav-item ms-lg-2">
              <Link className="btn btn-primary btn-sm" to="/checkout">
                <i className="bi bi-bag-check me-1"></i>
                Assinar plano
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
