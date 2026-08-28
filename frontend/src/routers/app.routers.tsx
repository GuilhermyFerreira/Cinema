import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { Rodape } from '../components/Layout/Rodape';
import {
  Home,
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
  NaoEncontrado,
} from '../pages';

/**
 * Roteamento da aplicação, organizado pelos três módulos do estudo de caso:
 * acadêmico/conteúdo, usuário/progresso e financeiro.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />

        <main className="container flex-grow-1 pb-4">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Módulo A — Acadêmico e de Conteúdo */}
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/novo" element={<CategoriaForm />} />
            <Route path="/categorias/editar/:id" element={<CategoriaForm />} />
            <Route path="/categorias/:id" element={<CategoriaDetalhe />} />

            <Route path="/cursos" element={<Cursos />} />
            <Route path="/cursos/novo" element={<CursoForm />} />
            <Route path="/cursos/editar/:id" element={<CursoForm />} />
            <Route path="/cursos/:id" element={<CursoDetalhe />} />

            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/trilhas/novo" element={<TrilhaForm />} />
            <Route path="/trilhas/editar/:id" element={<TrilhaForm />} />
            <Route path="/trilhas/:id" element={<TrilhaDetalhe />} />

            {/* Módulo B — Usuário e Progresso */}
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/novo" element={<UsuarioForm />} />
            <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />

            <Route path="/matriculas" element={<Matriculas />} />
            <Route path="/matriculas/novo" element={<MatriculaForm />} />

            <Route path="/progresso" element={<Progresso />} />
            <Route path="/avaliacoes" element={<Avaliacoes />} />

            <Route path="/certificados" element={<Certificados />} />
            <Route path="/certificados/:id" element={<CertificadoDetalhe />} />

            {/* Módulo C — Financeiro */}
            <Route path="/planos" element={<Planos />} />
            <Route path="/planos/novo" element={<PlanoForm />} />
            <Route path="/planos/editar/:id" element={<PlanoForm />} />

            <Route path="/checkout" element={<Checkout />} />
            <Route path="/assinaturas" element={<Assinaturas />} />
            <Route path="/pagamentos" element={<Pagamentos />} />

            <Route path="*" element={<NaoEncontrado />} />
          </Routes>
        </main>

        <Rodape />
      </div>
    </BrowserRouter>
  );
}
