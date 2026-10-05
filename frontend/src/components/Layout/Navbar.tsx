import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuSuspenso, type ItemMenu } from './MenuSuspenso';
import { Botao } from '../UI/Botao';
import { useAutenticacao } from '../../hooks/useAutenticacao';

/** Itens marcados com `publico` aparecem também para quem não está logado. */
type ItemMenuNavbar = ItemMenu & { publico?: boolean };

const MENU_ACADEMICO: ItemMenuNavbar[] = [
  { rotulo: 'Categorias', caminho: '/categorias', icone: 'bi-tags', publico: true },
  { rotulo: 'Cursos', caminho: '/cursos', icone: 'bi-journal-code', publico: true },
  { rotulo: 'Trilhas', caminho: '/trilhas', icone: 'bi-signpost-split', publico: true },
  { rotulo: 'Planos', caminho: '/planos', icone: 'bi-box-seam', publico: true },
];

/** Área pessoal: qualquer usuário logado, inclusive o Admin. */
const MENU_MINHA_AREA: ItemMenuNavbar[] = [
  { rotulo: 'Meus cursos', caminho: '/meus-cursos', icone: 'bi-journal-bookmark' },
  { rotulo: 'Meu progresso', caminho: '/meu-progresso', icone: 'bi-graph-up-arrow' },
  { rotulo: 'Meus certificados', caminho: '/meus-certificados', icone: 'bi-patch-check' },
];

/** Gestão de alunos: exclusivo do Admin. */
const MENU_ALUNOS: ItemMenuNavbar[] = [
  { rotulo: 'Usuários', caminho: '/usuarios', icone: 'bi-people' },
  { rotulo: 'Matrículas', caminho: '/matriculas', icone: 'bi-card-checklist' },
  { rotulo: 'Progresso', caminho: '/progresso', icone: 'bi-graph-up-arrow' },
  { rotulo: 'Avaliações', caminho: '/avaliacoes', icone: 'bi-star' },
  { rotulo: 'Certificados', caminho: '/certificados', icone: 'bi-patch-check' },
];

const MENU_FINANCEIRO: ItemMenuNavbar[] = [
  { rotulo: 'Assinaturas', caminho: '/assinaturas', icone: 'bi-arrow-repeat' },
  { rotulo: 'Pagamentos', caminho: '/pagamentos', icone: 'bi-cash-coin' },
];

/** Navbar responsiva com os três módulos do sistema agrupados em dropdowns. */
export function Navbar() {
  const [expandida, setExpandida] = useState(false);
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const { autenticado, ehAdmin, usuario, sair } = useAutenticacao();

  /** Esconde das áreas restritas o que o visitante não pode abrir. */
  function visiveis(itens: ItemMenuNavbar[]): ItemMenu[] {
    return itens.filter((item) => autenticado || item.publico);
  }

  function aoSair() {
    sair();
    setExpandida(false);
    navegar('/');
  }

  const primeiroNome = usuario?.nomeCompleto.trim().split(' ')[0] ?? '';

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
              itens={visiveis(MENU_ACADEMICO)}
            />

            {/* Área pessoal de quem está logado. */}
            {autenticado && (
              <MenuSuspenso
                titulo="Minha área"
                icone="bi-person-workspace"
                itens={MENU_MINHA_AREA}
              />
            )}

            {/* Gestão: exclusiva do administrador. */}
            {ehAdmin && (
              <>
                <MenuSuspenso
                  titulo="Alunos"
                  icone="bi-people"
                  itens={MENU_ALUNOS}
                />
                <MenuSuspenso
                  titulo="Financeiro"
                  icone="bi-wallet2"
                  itens={MENU_FINANCEIRO}
                />
              </>
            )}

            {!ehAdmin && (
              <li className="nav-item ms-lg-2">
                <Link
                  className="btn btn-primary btn-sm"
                  to="/checkout"
                  onClick={() => setExpandida(false)}
                >
                  <i className="bi bi-bag-check me-1"></i>
                  Assinar plano
                </Link>
              </li>
            )}

            {autenticado ? (
              <li className="nav-item d-flex align-items-center gap-2 mt-2 mt-lg-0 ms-lg-3">
                <span
                  className="navbar-text text-truncate"
                  title={usuario?.email}
                  style={{ maxWidth: '10rem' }}
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {primeiroNome}
                  {ehAdmin && (
                    <span className="badge text-bg-primary ms-2">Admin</span>
                  )}
                </span>
                <Botao
                  variante="outline-secondary"
                  tamanho="sm"
                  icone="bi-box-arrow-right"
                  onClick={aoSair}
                >
                  Sair
                </Botao>
              </li>
            ) : (
              <li className="nav-item mt-2 mt-lg-0 ms-lg-3">
                <Link
                  className="btn btn-outline-primary btn-sm"
                  to="/login"
                  onClick={() => setExpandida(false)}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Entrar
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
