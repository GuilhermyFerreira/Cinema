import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  categoriaService,
  cursoService,
  trilhaService,
  usuarioService,
} from '../services';
import type { ICategoria, ICurso, ITrilha, IUsuario } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Selo } from '../components/UI/Selo';
import { CartaoCurso } from '../components/Cursos/CartaoCurso';

/**
 * Visualiza a relação Categoria -> Cursos/Trilhas, atendendo ao requisito de
 * listar os cursos de uma categoria específica.
 */
export function CategoriaDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [categoria, setCategoria] = useState<ICategoria | null>(null);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [trilhas, setTrilhas] = useState<ITrilha[]>([]);
  const [instrutores, setInstrutores] = useState<IUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const [categoriaAtual, cursosDaCategoria, trilhasDaCategoria, usuarios] =
          await Promise.all([
            categoriaService.obter(id),
            cursoService.listarPorCategoria(id),
            trilhaService.listarPorCategoria(id),
            usuarioService.listar(),
          ]);

        setCategoria(categoriaAtual);
        setCursos(cursosDaCategoria);
        setTrilhas(trilhasDaCategoria);
        setInstrutores(usuarios);
      } catch (falha) {
        console.error('Erro ao carregar categoria:', falha);
        setErro('Não foi possível carregar os dados da categoria.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  function nomeInstrutor(idInstrutor: string): string {
    return (
      instrutores.find((usuario) => usuario.id === idInstrutor)?.nomeCompleto ??
      'Instrutor não informado'
    );
  }

  if (carregando) return <Carregando />;
  if (erro) return <Alerta tipo="danger">{erro}</Alerta>;
  if (!categoria) return <Alerta tipo="warning">Categoria não encontrada.</Alerta>;

  return (
    <div>
      <Cabecalho
        titulo={categoria.nome}
        descricao={categoria.descricao}
        icone="bi-tag-fill"
        acoes={
          <Link to="/categorias" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Voltar
          </Link>
        }
      />

      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            Cursos da categoria <Selo texto={String(cursos.length)} cor="primary" />
          </h4>
          <Link to="/cursos/novo" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-plus-lg me-1"></i>Novo curso
          </Link>
        </div>

        {cursos.length === 0 ? (
          <EstadoVazio
            mensagem="Nenhum curso vinculado a esta categoria."
            icone="bi-journal-x"
          />
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {cursos.map((curso) => (
              <CartaoCurso
                key={curso.id}
                curso={curso}
                nomeCategoria={categoria.nome}
                nomeInstrutor={nomeInstrutor(curso.idInstrutor)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="mb-3">
          Trilhas da categoria <Selo texto={String(trilhas.length)} cor="secondary" />
        </h4>

        {trilhas.length === 0 ? (
          <EstadoVazio
            mensagem="Nenhuma trilha vinculada a esta categoria."
            icone="bi-signpost"
          />
        ) : (
          <div className="list-group shadow-sm">
            {trilhas.map((trilha) => (
              <Link
                key={trilha.id}
                to={`/trilhas/${trilha.id}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <span>
                  <i className="bi bi-signpost-split me-2 text-primary"></i>
                  <strong>{trilha.titulo}</strong>
                  <span className="d-block small text-body-secondary ms-4">
                    {trilha.descricao}
                  </span>
                </span>
                <i className="bi bi-chevron-right"></i>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
