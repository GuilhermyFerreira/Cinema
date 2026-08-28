import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  trilhaService,
  trilhaCursoService,
  cursoService,
  categoriaService,
} from '../services';
import type { ITrilha, ITrilhaCurso, ICurso } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Selo } from '../components/UI/Selo';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { CampoTexto } from '../components/Formulario/CampoTexto';

/**
 * Curadoria da trilha: gerencia a tabela associativa Trilhas_Cursos,
 * definindo quais cursos compõem a trilha e em qual sequência (campo Ordem).
 */
export function TrilhaDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [trilha, setTrilha] = useState<ITrilha | null>(null);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [vinculos, setVinculos] = useState<ITrilhaCurso[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [formVinculo, setFormVinculo] = useState({ idCurso: '', ordem: '1' });

  const carregarVinculos = useCallback(async () => {
    if (!id) return;
    setVinculos(await trilhaCursoService.listarPorTrilha(id));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const trilhaAtual = await trilhaService.obter(id);
        setTrilha(trilhaAtual);

        const [categoria, listaCursos] = await Promise.all([
          categoriaService.obter(trilhaAtual.idCategoria).catch(() => null),
          cursoService.listar(),
        ]);

        setNomeCategoria(categoria?.nome ?? 'Sem categoria');
        setCursos(listaCursos);
        await carregarVinculos();
      } catch (falha) {
        console.error('Erro ao carregar trilha:', falha);
        setErro('Não foi possível carregar a trilha.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, carregarVinculos]);

  async function abrirModal() {
    if (!id) return;
    setFormVinculo({
      idCurso: '',
      ordem: String(await trilhaCursoService.proximaOrdem(id)),
    });
    setModalAberto(true);
  }

  async function adicionarCurso() {
    if (!id) return;

    if (!formVinculo.idCurso) {
      setErro('Selecione um curso para adicionar à trilha.');
      return;
    }

    try {
      if (await trilhaCursoService.jaVinculado(id, formVinculo.idCurso)) {
        setErro('Este curso já faz parte da trilha.');
        return;
      }

      await trilhaCursoService.criar({
        idTrilha: id,
        idCurso: formVinculo.idCurso,
        ordem: Number(formVinculo.ordem),
      });

      setModalAberto(false);
      setErro('');
      await carregarVinculos();
    } catch (falha) {
      console.error('Erro ao vincular curso:', falha);
      setErro('Não foi possível adicionar o curso à trilha.');
    }
  }

  async function removerCurso(vinculo: ITrilhaCurso) {
    try {
      await trilhaCursoService.excluir(vinculo.id as string);
      await carregarVinculos();
    } catch (falha) {
      console.error('Erro ao remover curso da trilha:', falha);
    }
  }

  /** Troca a posição de um curso com o vizinho, reescrevendo o campo Ordem. */
  async function mover(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= vinculos.length) return;

    const atual = vinculos[indice];
    const vizinho = vinculos[destino];

    try {
      await Promise.all([
        trilhaCursoService.atualizar(atual.id as string, {
          ...atual,
          ordem: vizinho.ordem,
        }),
        trilhaCursoService.atualizar(vizinho.id as string, {
          ...vizinho,
          ordem: atual.ordem,
        }),
      ]);
      await carregarVinculos();
    } catch (falha) {
      console.error('Erro ao reordenar trilha:', falha);
    }
  }

  function buscarCurso(idCurso: string): ICurso | undefined {
    return cursos.find((curso) => curso.id === idCurso);
  }

  if (carregando) return <Carregando />;
  if (!trilha) return <Alerta tipo="warning">Trilha não encontrada.</Alerta>;

  const idsVinculados = vinculos.map((vinculo) => vinculo.idCurso);
  const disponiveis = cursos.filter((curso) => !idsVinculados.includes(curso.id as string));

  const cargaTotal = vinculos.reduce(
    (total, vinculo) => total + (buscarCurso(vinculo.idCurso)?.totalHoras ?? 0),
    0,
  );

  return (
    <div>
      <Cabecalho
        titulo={trilha.titulo}
        descricao={trilha.descricao}
        icone="bi-signpost-split"
        acoes={
          <>
            <Link to="/trilhas" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>Voltar
            </Link>
            <Link
              to={`/trilhas/editar/${trilha.id}`}
              className="btn btn-outline-primary"
            >
              <i className="bi bi-pencil me-2"></i>Editar
            </Link>
          </>
        }
      />

      {erro && (
        <Alerta tipo="warning" aoFechar={() => setErro('')}>
          {erro}
        </Alerta>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Selo texto={nomeCategoria} cor="info" contorno icone="bi-tag" />
        <Selo
          texto={`${vinculos.length} curso(s)`}
          cor="primary"
          icone="bi-journal-code"
        />
        <Selo texto={`${cargaTotal}h no total`} cor="secondary" icone="bi-clock" />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Sequência de cursos</h4>
        <Botao icone="bi-plus-lg" onClick={abrirModal} disabled={!disponiveis.length}>
          Adicionar curso
        </Botao>
      </div>

      {vinculos.length === 0 ? (
        <EstadoVazio
          mensagem="Esta trilha ainda não possui cursos."
          icone="bi-journal-x"
          acao={
            <Botao icone="bi-plus-lg" onClick={abrirModal}>
              Adicionar o primeiro curso
            </Botao>
          }
        />
      ) : (
        <div className="list-group shadow-sm">
          {vinculos.map((vinculo, indice) => {
            const curso = buscarCurso(vinculo.idCurso);

            return (
              <div
                className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-3"
                key={vinculo.id}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="badge text-bg-primary fs-6">
                    {vinculo.ordem}
                  </span>
                  <div>
                    <div className="fw-semibold">
                      {curso?.titulo ?? 'Curso removido'}
                    </div>
                    <small className="text-body-secondary">
                      {curso
                        ? `${curso.nivel} · ${curso.totalAulas} aulas · ${curso.totalHoras}h`
                        : 'Vínculo órfão'}
                    </small>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <Botao
                    variante="outline-secondary"
                    tamanho="sm"
                    icone="bi-arrow-up"
                    disabled={indice === 0}
                    onClick={() => mover(indice, -1)}
                  >
                    {''}
                  </Botao>
                  <Botao
                    variante="outline-secondary"
                    tamanho="sm"
                    icone="bi-arrow-down"
                    disabled={indice === vinculos.length - 1}
                    onClick={() => mover(indice, 1)}
                  >
                    {''}
                  </Botao>
                  {curso && (
                    <Link
                      to={`/cursos/${curso.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-eye"></i>
                    </Link>
                  )}
                  <Botao
                    variante="outline-danger"
                    tamanho="sm"
                    icone="bi-x-lg"
                    onClick={() => removerCurso(vinculo)}
                  >
                    {''}
                  </Botao>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        aberto={modalAberto}
        titulo="Adicionar curso à trilha"
        icone="bi-journal-plus"
        aoFechar={() => setModalAberto(false)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao variante="success" icone="bi-check-lg" onClick={adicionarCurso}>
              Adicionar
            </Botao>
          </>
        }
      >
        <div className="row g-3">
          <CampoSelect
            className="col-md-8"
            label="Curso"
            name="idCurso"
            value={formVinculo.idCurso}
            onChange={(evento) =>
              setFormVinculo((anterior) => ({
                ...anterior,
                idCurso: evento.target.value,
              }))
            }
            opcoes={disponiveis.map((curso) => ({
              label: `${curso.titulo} (${curso.nivel})`,
              value: curso.id as string,
            }))}
          />
          <CampoTexto
            className="col-md-4"
            label="Ordem"
            name="ordem"
            type="number"
            min={1}
            value={formVinculo.ordem}
            onChange={(evento) =>
              setFormVinculo((anterior) => ({
                ...anterior,
                ordem: evento.target.value,
              }))
            }
            ajuda="Posição na trilha."
          />
        </div>
      </Modal>
    </div>
  );
}
