import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trilhaService, trilhaCursoService, categoriaService } from '../services';
import type { ITrilha, ITrilhaCurso, ICategoria } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { CartaoTrilha } from '../components/Trilhas/CartaoTrilha';

/** Listagem das trilhas de conhecimento, com filtro por categoria. */
export function Trilhas() {
  const [trilhas, setTrilhas] = useState<ITrilha[]>([]);
  const [vinculos, setVinculos] = useState<ITrilhaCurso[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [paraExcluir, setParaExcluir] = useState<ITrilha | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaTrilhas, listaVinculos, listaCategorias] = await Promise.all([
        trilhaService.listar(),
        trilhaCursoService.listar(),
        categoriaService.listar(),
      ]);

      setTrilhas(listaTrilhas);
      setVinculos(listaVinculos);
      setCategorias(listaCategorias);
    } catch (erro) {
      console.error('Erro ao carregar trilhas:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      // Remove primeiro os vínculos da tabela associativa Trilhas_Cursos.
      const doTrilha = vinculos.filter((v) => v.idTrilha === paraExcluir.id);
      await Promise.all(
        doTrilha.map((v) => trilhaCursoService.excluir(v.id as string)),
      );
      await trilhaService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir trilha:', erro);
    }
  }

  function nomeCategoria(idCategoria: string): string {
    return (
      categorias.find((categoria) => categoria.id === idCategoria)?.nome ??
      'Sem categoria'
    );
  }

  const filtradas = filtroCategoria
    ? trilhas.filter((trilha) => trilha.idCategoria === filtroCategoria)
    : trilhas;

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Trilhas de conhecimento"
        descricao="Sequências de cursos que formam um caminho de aprendizagem."
        icone="bi-signpost-split"
        textoBotao="Nova trilha"
        linkBotao="/trilhas/novo"
      />

      <div className="row mb-4">
        <div className="col-md-4">
          <select
            className="form-select"
            value={filtroCategoria}
            onChange={(evento) => setFiltroCategoria(evento.target.value)}
            aria-label="Filtrar trilhas por categoria"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhuma trilha cadastrada."
          icone="bi-signpost"
          acao={
            <Link to="/trilhas/novo" className="btn btn-primary">
              Criar a primeira trilha
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {filtradas.map((trilha) => (
            <CartaoTrilha
              key={trilha.id}
              trilha={trilha}
              nomeCategoria={nomeCategoria(trilha.idCategoria)}
              totalCursos={
                vinculos.filter((v) => v.idTrilha === trilha.id).length
              }
              aoExcluir={() => setParaExcluir(trilha)}
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
          Deseja realmente excluir a trilha{' '}
          <strong>{paraExcluir?.titulo}</strong>? Os cursos continuam
          cadastrados; apenas o vínculo com a trilha é removido.
        </p>
      </Modal>
    </div>
  );
}
