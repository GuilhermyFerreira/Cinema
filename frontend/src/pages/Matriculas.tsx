import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matriculaService, usuarioService, cursoService } from '../services';
import type { IMatricula, IUsuario, ICurso } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Tabela } from '../components/UI/Tabela';
import { Selo } from '../components/UI/Selo';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { Alerta } from '../components/UI/Alerta';
import { formatarData, hojeInputData } from '../utils/formatadores';

/** Listagem de matrículas, com conclusão e cancelamento. */
export function Matriculas() {
  const [matriculas, setMatriculas] = useState<IMatricula[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAluno, setFiltroAluno] = useState('');
  const [paraExcluir, setParaExcluir] = useState<IMatricula | null>(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaMatriculas, listaUsuarios, listaCursos] = await Promise.all([
        matriculaService.listar(),
        usuarioService.listar(),
        cursoService.listar(),
      ]);

      setMatriculas(listaMatriculas);
      setUsuarios(listaUsuarios);
      setCursos(listaCursos);
    } catch (erro) {
      console.error('Erro ao carregar matrículas:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function concluir(matricula: IMatricula) {
    try {
      await matriculaService.concluir(matricula.id as string, hojeInputData());
      setMensagem('Matrícula marcada como concluída. Já é possível emitir o certificado.');
      carregarDados();
    } catch (erro) {
      console.error('Erro ao concluir matrícula:', erro);
    }
  }

  async function reabrir(matricula: IMatricula) {
    try {
      await matriculaService.atualizar(matricula.id as string, {
        ...matricula,
        dataConclusao: null,
      });
      carregarDados();
    } catch (erro) {
      console.error('Erro ao reabrir matrícula:', erro);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await matriculaService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir matrícula:', erro);
    }
  }

  function nomeAluno(idUsuario: string): string {
    return (
      usuarios.find((usuario) => usuario.id === idUsuario)?.nomeCompleto ??
      'Aluno removido'
    );
  }

  function tituloCurso(idCurso: string): string {
    return cursos.find((curso) => curso.id === idCurso)?.titulo ?? 'Curso removido';
  }

  const filtradas = filtroAluno
    ? matriculas.filter((matricula) => matricula.idUsuario === filtroAluno)
    : matriculas;

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Matrículas"
        descricao="Vínculo entre alunos e cursos, com a data de conclusão."
        icone="bi-card-checklist"
        textoBotao="Nova matrícula"
        linkBotao="/matriculas/novo"
      />

      {mensagem && (
        <Alerta tipo="success" aoFechar={() => setMensagem('')}>
          {mensagem}
        </Alerta>
      )}

      <div className="row mb-4">
        <div className="col-md-5">
          <select
            className="form-select"
            value={filtroAluno}
            onChange={(evento) => setFiltroAluno(evento.target.value)}
            aria-label="Filtrar por aluno"
          >
            <option value="">Todos os alunos</option>
            {usuarios
              .filter((usuario) => usuario.perfil === 'Aluno')
              .map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nomeCompleto}
                </option>
              ))}
          </select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhuma matrícula registrada."
          icone="bi-card-checklist"
          acao={
            <Link to="/matriculas/novo" className="btn btn-primary">
              Matricular um aluno
            </Link>
          }
        />
      ) : (
        <div className="card shadow-sm">
          <Tabela
            colunas={['Aluno', 'Curso', 'Matrícula', 'Conclusão', 'Situação', 'Ações']}
          >
            {filtradas.map((matricula) => {
              const concluida = Boolean(matricula.dataConclusao);

              return (
                <tr key={matricula.id}>
                  <td className="fw-semibold">{nomeAluno(matricula.idUsuario)}</td>
                  <td>{tituloCurso(matricula.idCurso)}</td>
                  <td>{formatarData(matricula.dataMatricula)}</td>
                  <td>{formatarData(matricula.dataConclusao)}</td>
                  <td>
                    <Selo
                      texto={concluida ? 'Concluído' : 'Em andamento'}
                      cor={concluida ? 'success' : 'warning'}
                      icone={concluida ? 'bi-check-circle' : 'bi-hourglass-split'}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {concluida ? (
                        <Botao
                          variante="outline-warning"
                          tamanho="sm"
                          icone="bi-arrow-counterclockwise"
                          onClick={() => reabrir(matricula)}
                        >
                          Reabrir
                        </Botao>
                      ) : (
                        <Botao
                          variante="outline-success"
                          tamanho="sm"
                          icone="bi-check-lg"
                          onClick={() => concluir(matricula)}
                        >
                          Concluir
                        </Botao>
                      )}
                      <Botao
                        variante="outline-danger"
                        tamanho="sm"
                        icone="bi-trash"
                        onClick={() => setParaExcluir(matricula)}
                      >
                        {''}
                      </Botao>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Tabela>
        </div>
      )}

      <Modal
        aberto={paraExcluir !== null}
        titulo="Cancelar matrícula"
        icone="bi-exclamation-triangle"
        aoFechar={() => setParaExcluir(null)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setParaExcluir(null)}>
              Voltar
            </Botao>
            <Botao variante="danger" icone="bi-trash" onClick={confirmarExclusao}>
              Cancelar matrícula
            </Botao>
          </>
        }
      >
        <p className="mb-0">
          Deseja cancelar a matrícula de{' '}
          <strong>{paraExcluir && nomeAluno(paraExcluir.idUsuario)}</strong> no
          curso <strong>{paraExcluir && tituloCurso(paraExcluir.idCurso)}</strong>?
        </p>
      </Modal>
    </div>
  );
}
