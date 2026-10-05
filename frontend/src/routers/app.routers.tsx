import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { Rodape } from '../components/Layout/Rodape';
import { RotaProtegida } from '../components/Layout/RotaProtegida';
import {
  Home,
  Login,
  Cadastro,
  Usuarios,
  UsuarioForm,
  Categorias,
  CategoriaForm,
  CategoriaDetalhe,
  Cursos,
  CursoForm,
  CursoDetalhe,
  Trilhas,
  TrilhaForm,
  TrilhaDetalhe,
  Matriculas,
  MatriculaForm,
  Progresso,
  Avaliacoes,
  Certificados,
  CertificadoDetalhe,
  Planos,
  PlanoForm,
  Checkout,
  Assinaturas,
  Pagamentos,
  MeusCursos,
  MeuProgresso,
  MeusCertificados,
  NaoEncontrado,
} from '../pages';

/**
 * Roteamento da aplicação, organizado pelos três módulos do estudo de caso:
 * acadêmico/conteúdo, usuário/progresso e financeiro.
 *
 * As rotas são divididas em dois grupos: a vitrine pública (início, catálogo e
 * planos) e as áreas de gestão, agrupadas sob `<RotaProtegida>` — sem sessão
 * ativa elas redirecionam para `/login`. A ordem das rotas não importa: o React
 * Router dá preferência a segmentos fixos (`/cursos/novo`) sobre dinâmicos
 * (`/cursos/:id`).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />

        <main className="container flex-grow-1 pb-4">
          <Routes>
            {/* ---------- Público: autenticação ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* ---------- Público: vitrine ---------- */}
            <Route path="/" element={<Home />} />

            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/:id" element={<CategoriaDetalhe />} />

            <Route path="/cursos" element={<Cursos />} />
            <Route path="/cursos/:id" element={<CursoDetalhe />} />

            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/trilhas/:id" element={<TrilhaDetalhe />} />

            <Route path="/planos" element={<Planos />} />

            {/* ---------- Restrito: qualquer usuário logado ---------- */}
            <Route element={<RotaProtegida />}>
              <Route path="/meus-cursos" element={<MeusCursos />} />
              <Route path="/meu-progresso" element={<MeuProgresso />} />
              <Route path="/meus-certificados" element={<MeusCertificados />} />

              {/* O aluno assina um plano por conta própria. */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/certificados/:id" element={<CertificadoDetalhe />} />
            </Route>

            {/* ---------- Restrito: apenas Admin ---------- */}
            <Route element={<RotaProtegida papel="Admin" />}>
              {/* Módulo A — Acadêmico e de Conteúdo (edição) */}
              <Route path="/categorias/novo" element={<CategoriaForm />} />
              <Route path="/categorias/editar/:id" element={<CategoriaForm />} />

              <Route path="/cursos/novo" element={<CursoForm />} />
              <Route path="/cursos/editar/:id" element={<CursoForm />} />

              <Route path="/trilhas/novo" element={<TrilhaForm />} />
              <Route path="/trilhas/editar/:id" element={<TrilhaForm />} />

              {/* Módulo B — Usuário e Progresso */}
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/usuarios/novo" element={<UsuarioForm />} />
              <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />

              <Route path="/matriculas" element={<Matriculas />} />
              <Route path="/matriculas/novo" element={<MatriculaForm />} />

              <Route path="/progresso" element={<Progresso />} />
              <Route path="/avaliacoes" element={<Avaliacoes />} />

              <Route path="/certificados" element={<Certificados />} />

              {/* Módulo C — Financeiro */}
              <Route path="/planos/novo" element={<PlanoForm />} />
              <Route path="/planos/editar/:id" element={<PlanoForm />} />

              <Route path="/assinaturas" element={<Assinaturas />} />
              <Route path="/pagamentos" element={<Pagamentos />} />
            </Route>

            <Route path="*" element={<NaoEncontrado />} />
          </Routes>
        </main>

        <Rodape />
      </div>
    </BrowserRouter>
  );
}
