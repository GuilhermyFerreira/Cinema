import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriaService, cursoService, trilhaService } from '../services';
import type { ICategoria } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Selo } from '../components/UI/Selo';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { Alerta } from '../components/UI/Alerta';

interface CategoriaComTotais extends ICategoria {
  totalCursos: number;
  totalTrilhas: number;
}

/** Listagem de categorias exibindo quantos cursos e trilhas cada uma agrupa. */
export function Categorias() {
  const [categorias, setCategorias] = useState<CategoriaComTotais[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paraExcluir, setParaExcluir] = useState<CategoriaComTotais | null>(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    setCarregando(true);
    try {
      const [lista, cursos, trilhas] = await Promise.all([
        categoriaService.listar(),
        cursoService.listar(),
        trilhaService.listar(),
      ]);

      setCategorias(
        lista.map((categoria) => ({
          ...categoria,
          totalCursos: cursos.filter((c) => c.idCategoria === categoria.id).length,
          totalTrilhas: trilhas.filter((t) => t.idCategoria === categoria.id).length,
        })),
      );
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    } finally {
      setCarregando(false);
    }
  }

  function solicitarExclusao(categoria: CategoriaComTotais) {
    // Categoria é chave estrangeira de Cursos e Trilhas.
    if (categoria.totalCursos > 0 || categoria.totalTrilhas > 0) {
      setAviso(
        `A categoria "${categoria.nome}" não pode ser excluída porque possui ${categoria.totalCursos} curso(s) e ${categoria.totalTrilhas} trilha(s) vinculados.`,
      );
      return;
    }
    setAviso('');
    setParaExcluir(categoria);
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await categoriaService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarCategorias();
    } catch (erro) {
      console.error('Erro ao excluir categoria:', erro);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Categorias"
        descricao="Agrupam cursos e trilhas por área de conhecimento."
        icone="bi-tags"
        textoBotao="Nova categoria"
        linkBotao="/categorias/novo"
      />

      {aviso && (
        <Alerta tipo="warning" aoFechar={() => setAviso('')}>
          {aviso}
        </Alerta>
      )}

      {categorias.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhuma categoria cadastrada."
          icone="bi-tags"
          acao={
            <Link to="/categorias/novo" className="btn btn-primary">
              Cadastrar a primeira categoria
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {categorias.map((categoria) => (
            <div className="col" key={categoria.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    <i className="bi bi-tag-fill me-2 text-info"></i>
                    {categoria.nome}
                  </h5>
                  <p className="card-text text-body-secondary small flex-grow-1">
                    {categoria.descricao}
                  </p>

                  <div className="d-flex gap-2 mb-3">
                    <Selo
                      texto={`${categoria.totalCursos} curso(s)`}
                      cor="primary"
                      icone="bi-journal-code"
                    />
                    <Selo
                      texto={`${categoria.totalTrilhas} trilha(s)`}
                      cor="secondary"
                      icone="bi-signpost-split"
                    />
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <Link
                      to={`/categorias/${categoria.id}`}
                      className="btn btn-primary btn-sm flex-grow-1"
                    >
                      <i className="bi bi-list-ul me-1"></i>Ver cursos
                    </Link>
                    <Link
                      to={`/categorias/editar/${categoria.id}`}
                      className="btn btn-outline-secondary btn-sm"
                      aria-label={`Editar ${categoria.nome}`}
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      aria-label={`Excluir ${categoria.nome}`}
                      onClick={() => solicitarExclusao(categoria)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
          Deseja realmente excluir a categoria{' '}
          <strong>{paraExcluir?.nome}</strong>?
        </p>
      </Modal>
    </div>
  );
}
