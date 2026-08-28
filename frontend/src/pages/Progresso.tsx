import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  usuarioService,
  matriculaService,
  cursoService,
  moduloService,
  aulaService,
  progressoService,
  certificadoService,
} from '../services';
import type {
  IUsuario,
  IMatricula,
  ICurso,
  IModulo,
  IAula,
  IProgressoAula,
} from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Selo } from '../components/UI/Selo';
import { Botao } from '../components/UI/Botao';
import { BarraProgresso } from '../components/UI/BarraProgresso';
import { formatarDuracao, hojeInputData } from '../utils/formatadores';
import { gerarCodigoVerificacao } from '../utils/geradores';

interface ModuloComAulas {
  modulo: IModulo;
  aulas: IAula[];
}

const ICONE_TIPO = {
  'Vídeo': 'bi-play-circle',
  'Texto': 'bi-file-text',
  'Quiz': 'bi-patch-question',
} as const;

/**
 * Acompanhamento de progresso: seleciona um aluno, lista os cursos em que ele
 * está matriculado e permite marcar cada aula como concluída (tabela
 * Progresso_Aulas). Ao concluir 100% do curso, o certificado pode ser emitido.
 */
export function Progresso() {
  const [alunos, setAlunos] = useState<IUsuario[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [matriculas, setMatriculas] = useState<IMatricula[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [cursoAberto, setCursoAberto] = useState('');
  const [conteudo, setConteudo] = useState<ModuloComAulas[]>([]);
  const [progressos, setProgressos] = useState<IProgressoAula[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [carregandoConteudo, setCarregandoConteudo] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [listaAlunos, listaCursos] = await Promise.all([
          usuarioService.listarPorPerfil('Aluno'),
          cursoService.listar(),
        ]);
        setAlunos(listaAlunos);
        setCursos(listaCursos);
      } catch (falha) {
        console.error('Erro ao carregar alunos:', falha);
        setErro('Não foi possível carregar os alunos.');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const carregarProgresso = useCallback(async (idAluno: string) => {
    setProgressos(await progressoService.listarPorUsuario(idAluno));
  }, []);

  async function selecionarAluno(idAluno: string) {
    setAlunoSelecionado(idAluno);
    setCursoAberto('');
    setConteudo([]);
    setMensagem('');

    if (!idAluno) {
      setMatriculas([]);
      setProgressos([]);
      return;
    }

    try {
      const [listaMatriculas] = await Promise.all([
        matriculaService.listarPorUsuario(idAluno),
        carregarProgresso(idAluno),
      ]);
      setMatriculas(listaMatriculas);
    } catch (falha) {
      console.error('Erro ao carregar matrículas do aluno:', falha);
      setErro('Não foi possível carregar as matrículas do aluno.');
    }
  }

  async function abrirCurso(idCurso: string) {
    if (cursoAberto === idCurso) {
      setCursoAberto('');
      return;
    }

    setCursoAberto(idCurso);
    setCarregandoConteudo(true);

    try {
      const modulos = await moduloService.listarPorCurso(idCurso);
      const comAulas = await Promise.all(
        modulos.map(async (modulo) => ({
          modulo,
          aulas: await aulaService.listarPorModulo(modulo.id as string),
        })),
      );
      setConteudo(comAulas);
    } catch (falha) {
      console.error('Erro ao carregar conteúdo do curso:', falha);
      setErro('Não foi possível carregar as aulas do curso.');
    } finally {
      setCarregandoConteudo(false);
    }
  }

  function estaConcluida(idAula: string): boolean {
    return progressos.some(
      (item) => item.idAula === idAula && item.status === 'Concluído',
    );
  }

  async function alternarAula(aula: IAula) {
    if (!alunoSelecionado) return;

    try {
      if (estaConcluida(aula.id as string)) {
        await progressoService.desmarcar(alunoSelecionado, aula.id as string);
      } else {
        await progressoService.registrar(
          alunoSelecionado,
          aula.id as string,
          'Concluído',
        );
      }
      await carregarProgresso(alunoSelecionado);
    } catch (falha) {
      console.error('Erro ao atualizar progresso:', falha);
      setErro('Não foi possível atualizar o progresso da aula.');
    }
  }

  /** Marca todas as aulas do curso aberto como concluídas de uma vez. */
  async function concluirCurso() {
    if (!alunoSelecionado) return;

    const todasAulas = conteudo.flatMap((item) => item.aulas);
    try {
      for (const aula of todasAulas) {
        if (!estaConcluida(aula.id as string)) {
          await progressoService.registrar(
            alunoSelecionado,
            aula.id as string,
            'Concluído',
          );
        }
      }
      await carregarProgresso(alunoSelecionado);
      setMensagem('Todas as aulas do curso foram marcadas como concluídas.');
    } catch (falha) {
      console.error('Erro ao concluir curso:', falha);
    }
  }

  /** Emite o certificado do curso concluído, gerando o código de verificação. */
  async function emitirCertificado(idCurso: string) {
    if (!alunoSelecionado) return;

    try {
      if (await certificadoService.jaEmitido(alunoSelecionado, idCurso)) {
        setErro('Este aluno já possui certificado para este curso.');
        return;
      }

      await certificadoService.criar({
        idUsuario: alunoSelecionado,
        idCurso,
        idTrilha: null,
        codigoVerificacao: gerarCodigoVerificacao(),
        dataEmissao: hojeInputData(),
      });

      // Registra a conclusão também na matrícula.
      const matricula = matriculas.find((item) => item.idCurso === idCurso);
      if (matricula?.id && !matricula.dataConclusao) {
        await matriculaService.concluir(matricula.id, hojeInputData());
        setMatriculas(await matriculaService.listarPorUsuario(alunoSelecionado));
      }

      setErro('');
      setMensagem('Certificado emitido com sucesso. Consulte-o em Certificados.');
    } catch (falha) {
      console.error('Erro ao emitir certificado:', falha);
      setErro('Não foi possível emitir o certificado.');
    }
  }

  if (carregando) return <Carregando />;

  const aulasDoCursoAberto = conteudo.flatMap((item) => item.aulas);
  const concluidasNoCurso = aulasDoCursoAberto.filter((aula) =>
    estaConcluida(aula.id as string),
  ).length;
  const cursoCompleto =
    aulasDoCursoAberto.length > 0 &&
    concluidasNoCurso === aulasDoCursoAberto.length;

  return (
    <div>
      <Cabecalho
        titulo="Controle de progresso"
        descricao="Marque as aulas concluídas por aluno e emita os certificados."
        icone="bi-graph-up-arrow"
      />

      {mensagem && (
        <Alerta tipo="success" aoFechar={() => setMensagem('')}>
          {mensagem}
        </Alerta>
      )}
      {erro && (
        <Alerta tipo="danger" aoFechar={() => setErro('')}>
          {erro}
        </Alerta>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label htmlFor="select-aluno" className="form-label fw-semibold">
            Aluno
          </label>
          <select
            id="select-aluno"
            className="form-select"
            value={alunoSelecionado}
            onChange={(evento) => selecionarAluno(evento.target.value)}
          >
            <option value="">Selecione um aluno...</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nomeCompleto} — {aluno.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!alunoSelecionado ? (
        <EstadoVazio
          mensagem="Selecione um aluno para acompanhar o progresso nos cursos."
          icone="bi-person-check"
        />
      ) : matriculas.length === 0 ? (
        <EstadoVazio
          mensagem="Este aluno ainda não possui matrículas."
          icone="bi-card-checklist"
          acao={
            <Link to="/matriculas/novo" className="btn btn-primary">
              Matricular em um curso
            </Link>
          }
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {matriculas.map((matricula) => {
            const curso = cursos.find((item) => item.id === matricula.idCurso);
            const aberto = cursoAberto === matricula.idCurso;

            return (
              <div className="card shadow-sm" key={matricula.id}>
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-journal-code me-2 text-primary"></i>
                      {curso?.titulo ?? 'Curso removido'}
                    </h5>
                    <div className="d-flex gap-2">
                      {curso && <Selo texto={curso.nivel} cor="primary" />}
                      <Selo
                        texto={
                          matricula.dataConclusao ? 'Concluído' : 'Em andamento'
                        }
                        cor={matricula.dataConclusao ? 'success' : 'warning'}
                      />
                    </div>
                  </div>

                  <Botao
                    variante={aberto ? 'secondary' : 'outline-primary'}
                    icone={aberto ? 'bi-chevron-up' : 'bi-list-check'}
                    onClick={() => abrirCurso(matricula.idCurso)}
                  >
                    {aberto ? 'Fechar' : 'Ver aulas'}
                  </Botao>
                </div>

                {aberto && (
                  <div className="card-body">
                    {carregandoConteudo ? (
                      <Carregando mensagem="Carregando aulas..." />
                    ) : conteudo.length === 0 ? (
                      <p className="text-body-secondary mb-0">
                        Este curso ainda não possui módulos e aulas cadastrados.
                      </p>
                    ) : (
                      <>
                        <div className="mb-4">
                          <BarraProgresso
                            concluidas={concluidasNoCurso}
                            total={aulasDoCursoAberto.length}
                            altura={12}
                          />
                        </div>

                        {conteudo.map(({ modulo, aulas }) => (
                          <div className="mb-4" key={modulo.id}>
                            <h6 className="fw-bold border-bottom pb-2">
                              <span className="badge text-bg-secondary me-2">
                                {modulo.ordem}
                              </span>
                              {modulo.titulo}
                            </h6>

                            {aulas.length === 0 ? (
                              <p className="small text-body-secondary mb-0">
                                Módulo sem aulas.
                              </p>
                            ) : (
                              <ul className="list-group list-group-flush">
                                {aulas.map((aula) => {
                                  const concluida = estaConcluida(aula.id as string);

                                  return (
                                    <li
                                      className="list-group-item d-flex justify-content-between align-items-center gap-3 px-0"
                                      key={aula.id}
                                    >
                                      <div className="form-check d-flex align-items-center gap-2">
                                        <input
                                          className="form-check-input mt-0"
                                          type="checkbox"
                                          id={`aula-${aula.id}`}
                                          checked={concluida}
                                          onChange={() => alternarAula(aula)}
                                        />
                                        <label
                                          className={`form-check-label ${concluida ? 'text-decoration-line-through text-body-secondary' : ''}`}
                                          htmlFor={`aula-${aula.id}`}
                                        >
                                          <i
                                            className={`bi ${ICONE_TIPO[aula.tipoConteudo]} me-2`}
                                          ></i>
                                          {modulo.ordem}.{aula.ordem} {aula.titulo}
                                        </label>
                                      </div>

                                      <div className="d-flex align-items-center gap-2">
                                        <span className="small text-body-secondary">
                                          {formatarDuracao(aula.duracaoMinutos)}
                                        </span>
                                        {concluida && (
                                          <Selo
                                            texto="Concluído"
                                            cor="success"
                                            icone="bi-check-lg"
                                          />
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ))}

                        <div className="d-flex flex-wrap gap-2 pt-3 border-top">
                          <Botao
                            variante="outline-success"
                            icone="bi-check2-all"
                            onClick={concluirCurso}
                            disabled={cursoCompleto}
                          >
                            Marcar todas as aulas
                          </Botao>
                          <Botao
                            variante="success"
                            icone="bi-patch-check"
                            onClick={() => emitirCertificado(matricula.idCurso)}
                            disabled={!cursoCompleto}
                          >
                            Emitir certificado
                          </Botao>
                          {!cursoCompleto && (
                            <span className="align-self-center small text-body-secondary">
                              O certificado é liberado ao concluir 100% das aulas.
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
