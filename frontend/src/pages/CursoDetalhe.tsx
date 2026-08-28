import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  cursoService,
  categoriaService,
  usuarioService,
  moduloService,
  aulaService,
  avaliacaoService,
} from '../services';
import {
  moduloSchema,
  aulaSchema,
  TIPOS_CONTEUDO,
  type ICurso,
  type IModulo,
  type IAula,
  type IAvaliacao,
  type IUsuario,
} from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Selo } from '../components/UI/Selo';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { Estrelas } from '../components/UI/Estrelas';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { extrairErros } from '../utils/validacao';
import { formatarData, formatarDuracao } from '../utils/formatadores';

const ICONE_TIPO = {
  'Vídeo': 'bi-play-circle',
  'Texto': 'bi-file-text',
  'Quiz': 'bi-patch-question',
} as const;

const AULA_VAZIA = {
  titulo: '',
  tipoConteudo: 'Vídeo',
  urlConteudo: '',
  duracaoMinutos: '10',
  ordem: '1',
};

/**
 * Página de conteúdo do curso: exibe a hierarquia Curso > Módulos > Aulas e
 * permite adicionar módulos ao curso e aulas a cada módulo, respeitando o
 * campo Ordem de cada nível.
 */
export function CursoDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [curso, setCurso] = useState<ICurso | null>(null);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [instrutor, setInstrutor] = useState<IUsuario | null>(null);
  const [modulos, setModulos] = useState<IModulo[]>([]);
  const [aulasPorModulo, setAulasPorModulo] = useState<Record<string, IAula[]>>({});
  const [avaliacoes, setAvaliacoes] = useState<IAvaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estado dos modais de módulo e de aula.
  const [moduloEmEdicao, setModuloEmEdicao] = useState<IModulo | null>(null);
  const [modalModuloAberto, setModalModuloAberto] = useState(false);
  const [formModulo, setFormModulo] = useState({ titulo: '', ordem: '1' });
  const [errosModulo, setErrosModulo] = useState<Record<string, string>>({});

  const [aulaEmEdicao, setAulaEmEdicao] = useState<IAula | null>(null);
  const [moduloDaAula, setModuloDaAula] = useState<IModulo | null>(null);
  const [formAula, setFormAula] = useState(AULA_VAZIA);
  const [errosAula, setErrosAula] = useState<Record<string, string>>({});

  const carregarConteudo = useCallback(async () => {
    if (!id) return;

    const listaModulos = await moduloService.listarPorCurso(id);
    setModulos(listaModulos);

    const aulas = await Promise.all(
      listaModulos.map(async (modulo) => ({
        idModulo: modulo.id as string,
        aulas: await aulaService.listarPorModulo(modulo.id as string),
      })),
    );

    setAulasPorModulo(
      Object.fromEntries(aulas.map((item) => [item.idModulo, item.aulas])),
    );
  }, [id]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const cursoAtual = await cursoService.obter(id);
        setCurso(cursoAtual);

        const [categoria, usuario, listaAvaliacoes] = await Promise.all([
          categoriaService.obter(cursoAtual.idCategoria).catch(() => null),
          usuarioService.obter(cursoAtual.idInstrutor).catch(() => null),
          avaliacaoService.listarPorCurso(id),
        ]);

        setNomeCategoria(categoria?.nome ?? 'Sem categoria');
        setInstrutor(usuario);
        setAvaliacoes(listaAvaliacoes);

        await carregarConteudo();
      } catch (falha) {
        console.error('Erro ao carregar curso:', falha);
        setErro('Não foi possível carregar o curso.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, carregarConteudo]);

  // ----- Módulos -------------------------------------------------------

  async function abrirModalModulo(modulo?: IModulo) {
    if (!id) return;
    setErrosModulo({});
    setModuloEmEdicao(modulo ?? null);
    setFormModulo({
      titulo: modulo?.titulo ?? '',
      ordem: String(modulo?.ordem ?? (await moduloService.proximaOrdem(id))),
    });
    setModalModuloAberto(true);
  }

  async function salvarModulo() {
    if (!id) return;
    try {
      const validado = moduloSchema.parse({ ...formModulo, idCurso: id });

      if (moduloEmEdicao?.id) {
        await moduloService.atualizar(moduloEmEdicao.id, validado);
      } else {
        await moduloService.criar(validado);
      }

      setModalModuloAberto(false);
      await carregarConteudo();
    } catch (falha) {
      const errosCampos = extrairErros(falha);
      if (Object.keys(errosCampos).length) {
        setErrosModulo(errosCampos);
      } else {
        console.error('Erro ao salvar módulo:', falha);
        setErro('Não foi possível salvar o módulo.');
      }
    }
  }

  async function excluirModulo(modulo: IModulo) {
    const aulas = aulasPorModulo[modulo.id as string] ?? [];
    if (aulas.length > 0) {
      setErro(
        `O módulo "${modulo.titulo}" possui ${aulas.length} aula(s). Remova as aulas antes de excluí-lo.`,
      );
      return;
    }
    try {
      await moduloService.excluir(modulo.id as string);
      await carregarConteudo();
    } catch (falha) {
      console.error('Erro ao excluir módulo:', falha);
    }
  }

  // ----- Aulas ---------------------------------------------------------

  async function abrirModalAula(modulo: IModulo, aula?: IAula) {
    setErrosAula({});
    setModuloDaAula(modulo);
    setAulaEmEdicao(aula ?? null);
    setFormAula({
      titulo: aula?.titulo ?? '',
      tipoConteudo: aula?.tipoConteudo ?? 'Vídeo',
      urlConteudo: aula?.urlConteudo ?? '',
      duracaoMinutos: String(aula?.duracaoMinutos ?? 10),
      ordem: String(
        aula?.ordem ?? (await aulaService.proximaOrdem(modulo.id as string)),
      ),
    });
  }

  async function salvarAula() {
    if (!moduloDaAula?.id) return;
    try {
      const validado = aulaSchema.parse({
        ...formAula,
        idModulo: moduloDaAula.id,
      });

      if (aulaEmEdicao?.id) {
        await aulaService.atualizar(aulaEmEdicao.id, validado);
      } else {
        await aulaService.criar(validado);
      }

      setModuloDaAula(null);
      setAulaEmEdicao(null);
      await carregarConteudo();
    } catch (falha) {
      const errosCampos = extrairErros(falha);
      if (Object.keys(errosCampos).length) {
        setErrosAula(errosCampos);
      } else {
        console.error('Erro ao salvar aula:', falha);
        setErro('Não foi possível salvar a aula.');
      }
    }
  }

  async function excluirAula(aula: IAula) {
    try {
      await aulaService.excluir(aula.id as string);
      await carregarConteudo();
    } catch (falha) {
      console.error('Erro ao excluir aula:', falha);
    }
  }

  // ----- Render --------------------------------------------------------

  if (carregando) return <Carregando />;
  if (!curso) return <Alerta tipo="warning">Curso não encontrado.</Alerta>;

  const todasAulas = Object.values(aulasPorModulo).flat();
  const duracaoTotal = todasAulas.reduce(
    (total, aula) => total + aula.duracaoMinutos,
    0,
  );
  const media = avaliacoes.length
    ? avaliacoes.reduce((total, item) => total + item.nota, 0) / avaliacoes.length
    : null;

  return (
    <div>
      <Cabecalho
        titulo={curso.titulo}
        descricao={curso.descricao}
        icone="bi-journal-code"
        acoes={
          <>
            <Link to="/cursos" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>Voltar
            </Link>
            <Link
              to={`/cursos/editar/${curso.id}`}
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

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <small className="text-body-secondary d-block">Categoria</small>
              <Selo texto={nomeCategoria} cor="info" contorno />
              <small className="text-body-secondary d-block mt-3">Nível</small>
              <Selo texto={curso.nivel} cor="primary" />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <small className="text-body-secondary d-block">Instrutor</small>
              <strong>{instrutor?.nomeCompleto ?? 'Não informado'}</strong>
              <small className="text-body-secondary d-block mt-3">
                Publicação
              </small>
              <strong>{formatarData(curso.dataPublicacao)}</strong>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <small className="text-body-secondary d-block">Conteúdo real</small>
              <strong>
                {modulos.length} módulos · {todasAulas.length} aulas
              </strong>
              <small className="text-body-secondary d-block mt-3">
                Duração somada
              </small>
              <strong>{formatarDuracao(duracaoTotal)}</strong>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <small className="text-body-secondary d-block">
                Avaliação ({avaliacoes.length})
              </small>
              {media != null ? (
                <Estrelas nota={media} />
              ) : (
                <span className="text-body-secondary">Sem avaliações</span>
              )}
              <small className="text-body-secondary d-block mt-3">
                Ficha do curso
              </small>
              <strong>
                {curso.totalAulas} aulas · {curso.totalHoras}h
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Estrutura do curso</h4>
        <Botao icone="bi-plus-lg" onClick={() => abrirModalModulo()}>
          Adicionar módulo
        </Botao>
      </div>

      {modulos.length === 0 ? (
        <EstadoVazio
          mensagem="Este curso ainda não possui módulos."
          icone="bi-collection"
          acao={
            <Botao icone="bi-plus-lg" onClick={() => abrirModalModulo()}>
              Criar o primeiro módulo
            </Botao>
          }
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {modulos.map((modulo) => {
            const aulas = aulasPorModulo[modulo.id as string] ?? [];

            return (
              <div className="card shadow-sm" key={modulo.id}>
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <h5 className="mb-0">
                    <span className="badge text-bg-primary me-2">
                      {modulo.ordem}
                    </span>
                    {modulo.titulo}
                    <span className="ms-2 small text-body-secondary fw-normal">
                      ({aulas.length} aula{aulas.length === 1 ? '' : 's'})
                    </span>
                  </h5>

                  <div className="d-flex gap-2">
                    <Botao
                      variante="outline-primary"
                      tamanho="sm"
                      icone="bi-plus-lg"
                      onClick={() => abrirModalAula(modulo)}
                    >
                      Aula
                    </Botao>
                    <Botao
                      variante="outline-secondary"
                      tamanho="sm"
                      icone="bi-pencil"
                      onClick={() => abrirModalModulo(modulo)}
                    >
                      {''}
                    </Botao>
                    <Botao
                      variante="outline-danger"
                      tamanho="sm"
                      icone="bi-trash"
                      onClick={() => excluirModulo(modulo)}
                    >
                      {''}
                    </Botao>
                  </div>
                </div>

                {aulas.length === 0 ? (
                  <div className="card-body text-center text-body-secondary small">
                    Nenhuma aula cadastrada neste módulo.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {aulas.map((aula) => (
                      <li
                        key={aula.id}
                        className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge text-bg-secondary">
                            {modulo.ordem}.{aula.ordem}
                          </span>
                          <div>
                            <div className="fw-semibold">
                              <i
                                className={`bi ${ICONE_TIPO[aula.tipoConteudo]} me-2 text-primary`}
                              ></i>
                              {aula.titulo}
                            </div>
                            <a
                              href={aula.urlConteudo}
                              target="_blank"
                              rel="noreferrer"
                              className="small text-body-secondary text-decoration-none"
                            >
                              <i className="bi bi-link-45deg me-1"></i>
                              {aula.urlConteudo}
                            </a>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <Selo texto={aula.tipoConteudo} cor="info" contorno />
                          <span className="small text-body-secondary">
                            {formatarDuracao(aula.duracaoMinutos)}
                          </span>
                          <Botao
                            variante="outline-secondary"
                            tamanho="sm"
                            icone="bi-pencil"
                            onClick={() => abrirModalAula(modulo, aula)}
                          >
                            {''}
                          </Botao>
                          <Botao
                            variante="outline-danger"
                            tamanho="sm"
                            icone="bi-trash"
                            onClick={() => excluirAula(aula)}
                          >
                            {''}
                          </Botao>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {avaliacoes.length > 0 && (
        <section className="mt-5">
          <h4 className="mb-3">Avaliações dos alunos</h4>
          <div className="list-group shadow-sm">
            {avaliacoes.map((avaliacao) => (
              <div className="list-group-item" key={avaliacao.id}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Estrelas nota={avaliacao.nota} mostrarValor={false} />
                  <small className="text-body-secondary">
                    {formatarData(avaliacao.dataAvaliacao)}
                  </small>
                </div>
                <p className="mb-0 text-body-secondary small">
                  {avaliacao.comentario || 'Sem comentário.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal
        aberto={modalModuloAberto}
        titulo={moduloEmEdicao ? 'Editar módulo' : 'Novo módulo'}
        icone="bi-collection"
        aoFechar={() => setModalModuloAberto(false)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setModalModuloAberto(false)}>
              Cancelar
            </Botao>
            <Botao variante="success" icone="bi-check-lg" onClick={salvarModulo}>
              Salvar módulo
            </Botao>
          </>
        }
      >
        <div className="row g-3">
          <CampoTexto
            className="col-md-8"
            label="Título do módulo"
            name="titulo"
            value={formModulo.titulo}
            onChange={(evento) =>
              setFormModulo((anterior) => ({
                ...anterior,
                titulo: evento.target.value,
              }))
            }
            erro={errosModulo.titulo}
            placeholder="Ex.: Fundamentos"
          />
          <CampoTexto
            className="col-md-4"
            label="Ordem"
            name="ordem"
            type="number"
            min={1}
            value={formModulo.ordem}
            onChange={(evento) =>
              setFormModulo((anterior) => ({
                ...anterior,
                ordem: evento.target.value,
              }))
            }
            erro={errosModulo.ordem}
            ajuda="Sequência dentro do curso."
          />
        </div>
      </Modal>

      <Modal
        aberto={moduloDaAula !== null}
        titulo={aulaEmEdicao ? 'Editar aula' : `Nova aula · ${moduloDaAula?.titulo ?? ''}`}
        icone="bi-play-btn"
        tamanho="lg"
        aoFechar={() => setModuloDaAula(null)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setModuloDaAula(null)}>
              Cancelar
            </Botao>
            <Botao variante="success" icone="bi-check-lg" onClick={salvarAula}>
              Salvar aula
            </Botao>
          </>
        }
      >
        <div className="row g-3">
          <CampoTexto
            className="col-12"
            label="Título da aula"
            name="titulo"
            value={formAula.titulo}
            onChange={(evento) =>
              setFormAula((anterior) => ({
                ...anterior,
                titulo: evento.target.value,
              }))
            }
            erro={errosAula.titulo}
            placeholder="Ex.: Instalando o ambiente"
          />

          <CampoSelect
            className="col-md-4"
            label="Tipo de conteúdo"
            name="tipoConteudo"
            value={formAula.tipoConteudo}
            onChange={(evento) =>
              setFormAula((anterior) => ({
                ...anterior,
                tipoConteudo: evento.target.value,
              }))
            }
            erro={errosAula.tipoConteudo}
            opcoes={TIPOS_CONTEUDO.map((tipo) => ({ label: tipo, value: tipo }))}
          />

          <CampoTexto
            className="col-md-4"
            label="Duração (minutos)"
            name="duracaoMinutos"
            type="number"
            min={1}
            value={formAula.duracaoMinutos}
            onChange={(evento) =>
              setFormAula((anterior) => ({
                ...anterior,
                duracaoMinutos: evento.target.value,
              }))
            }
            erro={errosAula.duracaoMinutos}
          />

          <CampoTexto
            className="col-md-4"
            label="Ordem"
            name="ordem"
            type="number"
            min={1}
            value={formAula.ordem}
            onChange={(evento) =>
              setFormAula((anterior) => ({
                ...anterior,
                ordem: evento.target.value,
              }))
            }
            erro={errosAula.ordem}
            ajuda="Sequência no módulo."
          />

          <CampoTexto
            className="col-12"
            label="URL do conteúdo"
            name="urlConteudo"
            type="url"
            value={formAula.urlConteudo}
            onChange={(evento) =>
              setFormAula((anterior) => ({
                ...anterior,
                urlConteudo: evento.target.value,
              }))
            }
            erro={errosAula.urlConteudo}
            placeholder="https://..."
          />
        </div>
      </Modal>
    </div>
  );
}
