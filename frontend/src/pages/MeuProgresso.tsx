import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  matriculaService,
  cursoService,
  moduloService,
  aulaService,
  progressoService,
  certificadoService,
} from '../services';
import type {
  IMatricula,
  ICurso,
  IModulo,
  IAula,
  IProgressoAula,
} from '../models';
import { useAutenticacao } from '../hooks/useAutenticacao';
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
 * Acompanhamento do próprio progresso. Diferente da tela administrativa, não
 * há seletor de aluno: o usuário é sempre o da sessão.
 */
export function MeuProgresso() {
  const { idLocal } = useAutenticacao();

  const [matriculas, setMatriculas] = useState<IMatricula[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [progressos, setProgressos] = useState<IProgressoAula[]>([]);
  const [cursoAberto, setCursoAberto] = useState('');
  const [conteudo, setConteudo] = useState<ModuloComAulas[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [carregandoConteudo, setCarregandoConteudo] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const carregarProgresso = useCallback(async () => {
    if (!idLocal) return;
    setProgressos(await progressoService.listarPorUsuario(idLocal));
  }, [idLocal]);

  useEffect(() => {
    if (!idLocal) {
      setCarregando(false);
      return;
    }

    (async () => {
      try {
        const [listaMatriculas, listaCursos] = await Promise.all([
          matriculaService.listarPorUsuario(idLocal),
          cursoService.listar(),
        ]);
        setMatriculas(listaMatriculas);
        setCursos(listaCursos);
        await carregarProgresso();
      } catch (falha) {
        console.error('Erro ao carregar o progresso:', falha);
        setErro('Não foi possível carregar seu progresso.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [idLocal, carregarProgresso]);

  async function abrirCurso(idCurso: string) {
    if (cursoAberto === idCurso) {
      setCursoAberto('');
      return;
    }

    setCursoAberto(idCurso);
    setCarregandoConteudo(true);

    try {
      const modulos = await moduloService.listarPorCurso(idCurso);
      setConteudo(
        await Promise.all(
          modulos.map(async (modulo) => ({
            modulo,
            aulas: await aulaService.listarPorModulo(modulo.id as string),
          })),
        ),
      );
    } catch (falha) {
      console.error('Erro ao carregar as aulas:', falha);
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
    if (!idLocal) return;

    try {
      if (estaConcluida(aula.id as string)) {
        await progressoService.desmarcar(idLocal, aula.id as string);
      } else {
        await progressoService.registrar(
          idLocal,
          aula.id as string,
          'Concluído',
        );
      }
      await carregarProgresso();
    } catch (falha) {
      console.error('Erro ao atualizar o progresso:', falha);
      setErro('Não foi possível atualizar a aula.');
    }
  }

  async function emitirCertificado(idCurso: string) {
    if (!idLocal) return;

    try {
      if (await certificadoService.jaEmitido(idLocal, idCurso)) {
        setErro('Você já possui certificado deste curso.');
        return;
      }

      await certificadoService.criar({
        idUsuario: idLocal,
        idCurso,
        idTrilha: null,
        codigoVerificacao: gerarCodigoVerificacao(),
        dataEmissao: hojeInputData(),
      });

      const matricula = matriculas.find((m) => m.idCurso === idCurso);
      if (matricula?.id && !matricula.dataConclusao) {
        await matriculaService.concluir(matricula.id, hojeInputData());
        setMatriculas(await matriculaService.listarPorUsuario(idLocal));
      }

      setErro('');
      setMensagem('Certificado emitido! Veja em "Meus certificados".');
    } catch (falha) {
      console.error('Erro ao emitir o certificado:', falha);
      setErro('Não foi possível emitir o certificado.');
    }
  }

  if (carregando) return <Carregando />;

  const aulasDoCurso = conteudo.flatMap((item) => item.aulas);
  const concluidasNoCurso = aulasDoCurso.filter((a) =>
    estaConcluida(a.id as string),
  ).length;
  const cursoCompleto =
    aulasDoCurso.length > 0 && concluidasNoCurso === aulasDoCurso.length;

  return (
    <div>
      <Cabecalho
        titulo="Meu progresso"
        descricao="Marque as aulas concluídas e emita seus certificados."
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

      {!idLocal ? (
        <Alerta tipo="warning">
          Não foi possível vincular sua conta aos dados do site. Verifique se o
          JSON Server está rodando e entre novamente.
        </Alerta>
      ) : matriculas.length === 0 ? (
        <EstadoVazio
          mensagem="Você ainda não está matriculado em nenhum curso."
          icone="bi-card-checklist"
          acao={
            <Link to="/cursos" className="btn btn-primary">
              Ver cursos disponíveis
            </Link>
          }
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {matriculas.map((matricula) => {
            const curso = cursos.find((c) => c.id === matricula.idCurso);
            const aberto = cursoAberto === matricula.idCurso;

            return (
              <div className="card shadow-sm" key={matricula.id}>
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-journal-code me-2 text-primary"></i>
                      {curso?.titulo ?? 'Curso removido'}
                    </h5>
                    <Selo
                      texto={
                        matricula.dataConclusao ? 'Concluído' : 'Em andamento'
                      }
                      cor={matricula.dataConclusao ? 'success' : 'warning'}
                    />
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
                        Este curso ainda não tem aulas cadastradas.
                      </p>
                    ) : (
                      <>
                        <div className="mb-4">
                          <BarraProgresso
                            concluidas={concluidasNoCurso}
                            total={aulasDoCurso.length}
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

                            <ul className="list-group list-group-flush">
                              {aulas.map((aula) => {
                                const feita = estaConcluida(aula.id as string);

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
                                        checked={feita}
                                        onChange={() => alternarAula(aula)}
                                      />
                                      <label
                                        className={`form-check-label ${feita ? 'text-decoration-line-through text-body-secondary' : ''}`}
                                        htmlFor={`aula-${aula.id}`}
                                      >
                                        <i
                                          className={`bi ${ICONE_TIPO[aula.tipoConteudo]} me-2`}
                                        ></i>
                                        {modulo.ordem}.{aula.ordem} {aula.titulo}
                                      </label>
                                    </div>

                                    <span className="small text-body-secondary">
                                      {formatarDuracao(aula.duracaoMinutos)}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}

                        <div className="d-flex flex-wrap gap-2 pt-3 border-top">
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
                              Conclua 100% das aulas para liberar o certificado.
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
