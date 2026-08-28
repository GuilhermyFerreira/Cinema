import { useEffect, useState } from 'react';
import { avaliacaoService, usuarioService, cursoService } from '../services';
import {
  avaliacaoSchema,
  type IAvaliacao,
  type IUsuario,
  type ICurso,
} from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { Estrelas } from '../components/UI/Estrelas';
import { Tabela } from '../components/UI/Tabela';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoNota } from '../components/Formulario/CampoNota';
import { extrairErros } from '../utils/validacao';
import { formatarData, hojeInputData } from '../utils/formatadores';

const FORMULARIO_VAZIO = {
  idUsuario: '',
  idCurso: '',
  nota: 5,
  comentario: '',
  dataAvaliacao: hojeInputData(),
};

/** Avaliações dos cursos, cadastradas em um modal sobre a própria listagem. */
export function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<IAvaliacao[]>([]);
  const [alunos, setAlunos] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroCurso, setFiltroCurso] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<IAvaliacao | null>(null);
  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [paraExcluir, setParaExcluir] = useState<IAvaliacao | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaAvaliacoes, listaAlunos, listaCursos] = await Promise.all([
        avaliacaoService.listar(),
        usuarioService.listarPorPerfil('Aluno'),
        cursoService.listar(),
      ]);

      setAvaliacoes(listaAvaliacoes);
      setAlunos(listaAlunos);
      setCursos(listaCursos);
    } catch (erro) {
      console.error('Erro ao carregar avaliações:', erro);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(avaliacao?: IAvaliacao) {
    setErros({});
    setErroGeral('');
    setEmEdicao(avaliacao ?? null);
    setDados(
      avaliacao
        ? {
            idUsuario: avaliacao.idUsuario,
            idCurso: avaliacao.idCurso,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario ?? '',
            dataAvaliacao: avaliacao.dataAvaliacao.split('T')[0],
          }
        : FORMULARIO_VAZIO,
    );
    setModalAberto(true);
  }

  async function salvar() {
    try {
      const validado = avaliacaoSchema.parse({
        ...dados,
        comentario: dados.comentario || null,
      });

      if (emEdicao?.id) {
        await avaliacaoService.atualizar(emEdicao.id, validado);
      } else {
        await avaliacaoService.criar(validado);
      }

      setModalAberto(false);
      carregarDados();
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar avaliação:', erro);
        setErroGeral('Não foi possível salvar a avaliação.');
      }
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await avaliacaoService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir avaliação:', erro);
    }
  }

  function nomeAluno(idUsuario: string): string {
    return (
      alunos.find((aluno) => aluno.id === idUsuario)?.nomeCompleto ??
      'Aluno removido'
    );
  }

  function tituloCurso(idCurso: string): string {
    return cursos.find((curso) => curso.id === idCurso)?.titulo ?? 'Curso removido';
  }

  if (carregando) return <Carregando />;

  const filtradas = filtroCurso
    ? avaliacoes.filter((avaliacao) => avaliacao.idCurso === filtroCurso)
    : avaliacoes;

  const media = filtradas.length
    ? filtradas.reduce((total, item) => total + item.nota, 0) / filtradas.length
    : null;

  return (
    <div>
      <Cabecalho
        titulo="Avaliações"
        descricao="Notas de 1 a 5 e comentários dos alunos sobre os cursos."
        icone="bi-star"
        acoes={
          <Botao icone="bi-plus-lg" onClick={() => abrirModal()}>
            Nova avaliação
          </Botao>
        }
      />

      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-5">
          <label htmlFor="filtro-curso" className="form-label">
            Filtrar por curso
          </label>
          <select
            id="filtro-curso"
            className="form-select"
            value={filtroCurso}
            onChange={(evento) => setFiltroCurso(evento.target.value)}
          >
            <option value="">Todos os cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo}
              </option>
            ))}
          </select>
        </div>

        {media != null && (
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body py-2">
                <small className="text-body-secondary d-block">
                  Média ({filtradas.length} avaliações)
                </small>
                <Estrelas nota={media} />
              </div>
            </div>
          </div>
        )}
      </div>

      {filtradas.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhuma avaliação registrada."
          icone="bi-star"
          acao={
            <Botao icone="bi-plus-lg" onClick={() => abrirModal()}>
              Registrar a primeira avaliação
            </Botao>
          }
        />
      ) : (
        <div className="card shadow-sm">
          <Tabela colunas={['Aluno', 'Curso', 'Nota', 'Comentário', 'Data', 'Ações']}>
            {filtradas.map((avaliacao) => (
              <tr key={avaliacao.id}>
                <td className="fw-semibold">{nomeAluno(avaliacao.idUsuario)}</td>
                <td>{tituloCurso(avaliacao.idCurso)}</td>
                <td>
                  <Estrelas nota={avaliacao.nota} mostrarValor={false} />
                </td>
                <td className="text-body-secondary small">
                  {avaliacao.comentario || '—'}
                </td>
                <td>{formatarData(avaliacao.dataAvaliacao)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Botao
                      variante="outline-secondary"
                      tamanho="sm"
                      icone="bi-pencil"
                      onClick={() => abrirModal(avaliacao)}
                    >
                      {''}
                    </Botao>
                    <Botao
                      variante="outline-danger"
                      tamanho="sm"
                      icone="bi-trash"
                      onClick={() => setParaExcluir(avaliacao)}
                    >
                      {''}
                    </Botao>
                  </div>
                </td>
              </tr>
            ))}
          </Tabela>
        </div>
      )}

      <Modal
        aberto={modalAberto}
        titulo={emEdicao ? 'Editar avaliação' : 'Nova avaliação'}
        icone="bi-star"
        tamanho="lg"
        aoFechar={() => setModalAberto(false)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao variante="success" icone="bi-check-lg" onClick={salvar}>
              Salvar avaliação
            </Botao>
          </>
        }
      >
        {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

        <div className="row g-3">
          <CampoSelect
            className="col-md-6"
            label="Aluno"
            name="idUsuario"
            value={dados.idUsuario}
            onChange={(evento) =>
              setDados((anterior) => ({
                ...anterior,
                idUsuario: evento.target.value,
              }))
            }
            erro={erros.idUsuario}
            opcoes={alunos.map((aluno) => ({
              label: aluno.nomeCompleto,
              value: aluno.id as string,
            }))}
          />

          <CampoSelect
            className="col-md-6"
            label="Curso"
            name="idCurso"
            value={dados.idCurso}
            onChange={(evento) =>
              setDados((anterior) => ({
                ...anterior,
                idCurso: evento.target.value,
              }))
            }
            erro={erros.idCurso}
            opcoes={cursos.map((curso) => ({
              label: curso.titulo,
              value: curso.id as string,
            }))}
          />

          <CampoNota
            className="col-md-6"
            label="Nota"
            value={dados.nota}
            onChange={(nota) => setDados((anterior) => ({ ...anterior, nota }))}
            erro={erros.nota}
          />

          <CampoTexto
            className="col-md-6"
            label="Data da avaliação"
            name="dataAvaliacao"
            type="date"
            value={dados.dataAvaliacao}
            onChange={(evento) =>
              setDados((anterior) => ({
                ...anterior,
                dataAvaliacao: evento.target.value,
              }))
            }
            erro={erros.dataAvaliacao}
          />

          <CampoTexto
            className="col-12"
            label="Comentário"
            name="comentario"
            textarea
            rows={3}
            value={dados.comentario}
            onChange={(evento) =>
              setDados((anterior) => ({
                ...anterior,
                comentario: evento.target.value,
              }))
            }
            erro={erros.comentario}
            ajuda="Campo opcional."
          />
        </div>
      </Modal>

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
        <p className="mb-0">Deseja realmente excluir esta avaliação?</p>
      </Modal>
    </div>
  );
}
