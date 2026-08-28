import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cursoService,
  categoriaService,
  usuarioService,
  avaliacaoService,
} from '../services';
import type { ICurso, ICategoria, IUsuario, IAvaliacao } from '../models';
import { NIVEIS } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { CartaoCurso } from '../components/Cursos/CartaoCurso';

/** Catálogo de cursos com filtros por categoria e nível. */
export function Cursos() {
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<IAvaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [busca, setBusca] = useState('');
  const [paraExcluir, setParaExcluir] = useState<ICurso | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaCursos, listaCategorias, listaUsuarios, listaAvaliacoes] =
        await Promise.all([
          cursoService.listar(),
          categoriaService.listar(),
          usuarioService.listar(),
          avaliacaoService.listar(),
        ]);

      setCursos(listaCursos);
      setCategorias(listaCategorias);
      setUsuarios(listaUsuarios);
      setAvaliacoes(listaAvaliacoes);
    } catch (erro) {
      console.error('Erro ao carregar cursos:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await cursoService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir curso:', erro);
    }
  }

  function nomeCategoria(idCategoria: string): string {
    return (
      categorias.find((categoria) => categoria.id === idCategoria)?.nome ??
      'Sem categoria'
    );
  }

  function nomeInstrutor(idInstrutor: string): string {
    return (
      usuarios.find((usuario) => usuario.id === idInstrutor)?.nomeCompleto ??
      'Instrutor não informado'
    );
  }

  function mediaDoCurso(idCurso: string): number | null {
    const notas = avaliacoes.filter((item) => item.idCurso === idCurso);
    if (!notas.length) return null;
    return notas.reduce((total, item) => total + item.nota, 0) / notas.length;
  }

  const filtrados = cursos.filter((curso) => {
    const combinaCategoria =
      !filtroCategoria || curso.idCategoria === filtroCategoria;
    const combinaNivel = !filtroNivel || curso.nivel === filtroNivel;
    const termo = busca.trim().toLowerCase();
    const combinaBusca =
      !termo ||
      curso.titulo.toLowerCase().includes(termo) ||
      curso.descricao.toLowerCase().includes(termo);
    return combinaCategoria && combinaNivel && combinaBusca;
  });

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Cursos"
        descricao="Catálogo completo, organizado por categoria e nível."
        icone="bi-journal-code"
        textoBotao="Novo curso"
        linkBotao="/cursos/novo"
      />

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar curso por título ou descrição..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <select
            className="form-select"
            value={filtroCategoria}
            onChange={(evento) => setFiltroCategoria(evento.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-3 col-md-6">
          <select
            className="form-select"
            value={filtroNivel}
            onChange={(evento) => setFiltroNivel(evento.target.value)}
            aria-label="Filtrar por nível"
          >
            <option value="">Todos os níveis</option>
            {NIVEIS.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhum curso encontrado com os filtros aplicados."
          icone="bi-journal-x"
          acao={
            <Link to="/cursos/novo" className="btn btn-primary">
              Cadastrar um curso
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {filtrados.map((curso) => (
            <CartaoCurso
              key={curso.id}
              curso={curso}
              nomeCategoria={nomeCategoria(curso.idCategoria)}
              nomeInstrutor={nomeInstrutor(curso.idInstrutor)}
              nota={mediaDoCurso(curso.id as string)}
              aoExcluir={() => setParaExcluir(curso)}
            />
          ))}
        </div>
      )}

      <Modal
        aberto={paraExcluir !== null}
        titulo="Confirmar exclusão"
        icone="bi-exclamation-triangle"
        aoFechar={() => setParaExcluir(null)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setParaExcluir(null)}>
              Cancelar
            </Botao>
            <Botao variante="danger" icone="bi-trash" onClick={confirmarExclusao}>
              Excluir
            </Botao>
          </>
        }
      >
        <p className="mb-0">
          Deseja realmente excluir o curso{' '}
          <strong>{paraExcluir?.titulo}</strong>? Os módulos e aulas vinculados
          deixarão de ter referência.
        </p>
      </Modal>
    </div>
  );
}
