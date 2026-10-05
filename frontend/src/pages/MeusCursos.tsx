import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  matriculaService,
  cursoService,
  moduloService,
  aulaService,
  progressoService,
} from '../services';
import type { ICurso, IMatricula } from '../models';
import { useAutenticacao } from '../hooks/useAutenticacao';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Selo } from '../components/UI/Selo';
import { BarraProgresso } from '../components/UI/BarraProgresso';
import { formatarData } from '../utils/formatadores';

interface CursoMatriculado {
  matricula: IMatricula;
  curso: ICurso | null;
  totalAulas: number;
  concluidas: number;
}

/**
 * Área do aluno: lista apenas os cursos em que ele próprio está matriculado,
 * com o progresso real calculado a partir das aulas concluídas.
 */
export function MeusCursos() {
  const { usuario, idLocal } = useAutenticacao();

  const [itens, setItens] = useState<CursoMatriculado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (!idLocal) {
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      const [matriculas, cursos, progressos] = await Promise.all([
        matriculaService.listarPorUsuario(idLocal),
        cursoService.listar(),
        progressoService.listarPorUsuario(idLocal),
      ]);

      const concluidas = new Set(
        progressos
          .filter((p) => p.status === 'Concluído')
          .map((p) => p.idAula),
      );

      const detalhados = await Promise.all(
        matriculas.map(async (matricula) => {
          const curso =
            cursos.find((c) => c.id === matricula.idCurso) ?? null;

          // Conta as aulas reais do curso percorrendo os módulos.
          const modulos = curso?.id
            ? await moduloService.listarPorCurso(curso.id)
            : [];
          const aulas = (
            await Promise.all(
              modulos.map((m) => aulaService.listarPorModulo(m.id as string)),
            )
          ).flat();

          return {
            matricula,
            curso,
            totalAulas: aulas.length,
            concluidas: aulas.filter((a) => concluidas.has(a.id as string))
              .length,
          };
        }),
      );

      setItens(detalhados);
    } catch (falha) {
      console.error('Erro ao carregar os cursos do aluno:', falha);
      setErro('Não foi possível carregar seus cursos.');
    } finally {
      setCarregando(false);
    }
  }, [idLocal]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) return <Carregando mensagem="Carregando seus cursos..." />;

  return (
    <div>
      <Cabecalho
        titulo={`Olá, ${usuario?.nomeCompleto.split(' ')[0] ?? ''}`}
        descricao="Os cursos em que você está matriculado e o seu progresso."
        icone="bi-journal-bookmark"
        acoes={
          <Link to="/cursos" className="btn btn-outline-primary">
            <i className="bi bi-search me-2"></i>Explorar catálogo
          </Link>
        }
      />

      {erro && <Alerta tipo="danger">{erro}</Alerta>}

      {!idLocal && (
        <Alerta tipo="warning">
          Não foi possível vincular sua conta aos dados do site. Verifique se o
          JSON Server está rodando (<code>npm run server</code>) e entre
          novamente.
        </Alerta>
      )}

      {itens.length === 0 ? (
        <EstadoVazio
          mensagem="Você ainda não está matriculado em nenhum curso."
          icone="bi-journal-x"
          acao={
            <Link to="/cursos" className="btn btn-primary">
              Ver cursos disponíveis
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {itens.map(({ matricula, curso, totalAulas, concluidas }) => {
            const completo = totalAulas > 0 && concluidas === totalAulas;

            return (
              <div className="col" key={matricula.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      {curso && <Selo texto={curso.nivel} cor="primary" />}
                      <Selo
                        texto={
                          matricula.dataConclusao ? 'Concluído' : 'Em andamento'
                        }
                        cor={matricula.dataConclusao ? 'success' : 'warning'}
                      />
                    </div>

                    <h5 className="card-title">
                      {curso?.titulo ?? 'Curso removido'}
                    </h5>
                    <p className="card-text text-body-secondary small flex-grow-1">
                      {curso?.descricao}
                    </p>

                    <div className="mb-3">
                      <BarraProgresso
                        concluidas={concluidas}
                        total={totalAulas}
                      />
                    </div>

                    <small className="text-body-secondary d-block mb-3">
                      <i className="bi bi-calendar3 me-2"></i>
                      Matriculado em {formatarData(matricula.dataMatricula)}
                    </small>

                    <div className="d-flex gap-2 mt-auto">
                      {curso && (
                        <Link
                          to={`/cursos/${curso.id}`}
                          className="btn btn-primary btn-sm flex-grow-1"
                        >
                          <i className="bi bi-play-circle me-1"></i>
                          {completo ? 'Revisar conteúdo' : 'Continuar'}
                        </Link>
                      )}
                      <Link
                        to="/meu-progresso"
                        className="btn btn-outline-secondary btn-sm"
                      >
                        <i className="bi bi-list-check"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
