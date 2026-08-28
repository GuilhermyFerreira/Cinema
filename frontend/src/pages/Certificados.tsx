import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  certificadoService,
  usuarioService,
  cursoService,
  trilhaService,
} from '../services';
import type { ICertificado, IUsuario, ICurso, ITrilha } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Tabela } from '../components/UI/Tabela';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { formatarData, hojeInputData } from '../utils/formatadores';
import { gerarCodigoVerificacao } from '../utils/geradores';

/**
 * Gestão de certificados: emissão manual, consulta pública pelo código de
 * verificação e visualização do documento.
 */
export function Certificados() {
  const [certificados, setCertificados] = useState<ICertificado[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [trilhas, setTrilhas] = useState<ITrilha[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modalEmissao, setModalEmissao] = useState(false);
  const [formEmissao, setFormEmissao] = useState({
    idUsuario: '',
    idCurso: '',
    idTrilha: '',
  });
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [codigoBusca, setCodigoBusca] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState<ICertificado | null>(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const [paraExcluir, setParaExcluir] = useState<ICertificado | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaCertificados, listaUsuarios, listaCursos, listaTrilhas] =
        await Promise.all([
          certificadoService.listar(),
          usuarioService.listar(),
          cursoService.listar(),
          trilhaService.listar(),
        ]);

      setCertificados(listaCertificados);
      setUsuarios(listaUsuarios);
      setCursos(listaCursos);
      setTrilhas(listaTrilhas);
    } catch (falha) {
      console.error('Erro ao carregar certificados:', falha);
    } finally {
      setCarregando(false);
    }
  }

  async function emitir() {
    setErro('');

    if (!formEmissao.idUsuario || !formEmissao.idCurso) {
      setErro('Selecione o aluno e o curso concluído.');
      return;
    }

    try {
      const duplicado = await certificadoService.jaEmitido(
        formEmissao.idUsuario,
        formEmissao.idCurso,
      );
      if (duplicado) {
        setErro('Este aluno já possui certificado para este curso.');
        return;
      }

      await certificadoService.criar({
        idUsuario: formEmissao.idUsuario,
        idCurso: formEmissao.idCurso,
        idTrilha: formEmissao.idTrilha || null,
        codigoVerificacao: gerarCodigoVerificacao(),
        dataEmissao: hojeInputData(),
      });

      setModalEmissao(false);
      setFormEmissao({ idUsuario: '', idCurso: '', idTrilha: '' });
      setMensagem('Certificado emitido com sucesso.');
      carregarDados();
    } catch (falha) {
      console.error('Erro ao emitir certificado:', falha);
      setErro('Não foi possível emitir o certificado.');
    }
  }

  async function verificarCodigo(evento: React.FormEvent) {
    evento.preventDefault();
    if (!codigoBusca.trim()) return;

    try {
      const encontrado = await certificadoService.verificar(codigoBusca.trim());
      setResultadoBusca(encontrado);
      setBuscaRealizada(true);
    } catch (falha) {
      console.error('Erro ao verificar certificado:', falha);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await certificadoService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (falha) {
      console.error('Erro ao excluir certificado:', falha);
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

  function tituloTrilha(idTrilha: string | null): string | null {
    if (!idTrilha) return null;
    return trilhas.find((trilha) => trilha.id === idTrilha)?.titulo ?? null;
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Certificados"
        descricao="Documentos emitidos aos alunos, com código único de verificação."
        icone="bi-patch-check"
        acoes={
          <Botao icone="bi-award" onClick={() => setModalEmissao(true)}>
            Emitir certificado
          </Botao>
        }
      />

      {mensagem && (
        <Alerta tipo="success" aoFechar={() => setMensagem('')}>
          {mensagem}
        </Alerta>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-search me-2 text-primary"></i>
            Verificar autenticidade
          </h5>
          <p className="text-body-secondary small">
            Informe o código impresso no certificado para confirmar sua validade.
          </p>

          <form onSubmit={verificarCodigo} className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control font-monospace"
                placeholder="CERT-XXXX-XXXX"
                value={codigoBusca}
                onChange={(evento) => {
                  setCodigoBusca(evento.target.value.toUpperCase());
                  setBuscaRealizada(false);
                }}
                aria-label="Código de verificação"
              />
            </div>
            <div className="col-md-3">
              <Botao type="submit" icone="bi-shield-check" larguraTotal>
                Verificar
              </Botao>
            </div>
          </form>

          {buscaRealizada && (
            <div className="mt-3">
              {resultadoBusca ? (
                <Alerta tipo="success">
                  Certificado <strong>válido</strong>, emitido para{' '}
                  <strong>{nomeAluno(resultadoBusca.idUsuario)}</strong> no curso{' '}
                  <strong>{tituloCurso(resultadoBusca.idCurso)}</strong> em{' '}
                  {formatarData(resultadoBusca.dataEmissao)}.{' '}
                  <Link to={`/certificados/${resultadoBusca.id}`}>
                    Ver documento
                  </Link>
                </Alerta>
              ) : (
                <Alerta tipo="danger">
                  Nenhum certificado encontrado com este código.
                </Alerta>
              )}
            </div>
          )}
        </div>
      </div>

      {certificados.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhum certificado emitido."
          icone="bi-patch-check"
          acao={
            <Botao icone="bi-award" onClick={() => setModalEmissao(true)}>
              Emitir o primeiro certificado
            </Botao>
          }
        />
      ) : (
        <div className="card shadow-sm">
          <Tabela
            colunas={['Aluno', 'Curso', 'Trilha', 'Código', 'Emissão', 'Ações']}
          >
            {certificados.map((certificado) => (
              <tr key={certificado.id}>
                <td className="fw-semibold">{nomeAluno(certificado.idUsuario)}</td>
                <td>{tituloCurso(certificado.idCurso)}</td>
                <td className="text-body-secondary">
                  {tituloTrilha(certificado.idTrilha) ?? '—'}
                </td>
                <td className="font-monospace text-primary">
                  {certificado.codigoVerificacao}
                </td>
                <td>{formatarData(certificado.dataEmissao)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/certificados/${certificado.id}`}
                      className="btn btn-outline-primary btn-sm"
                      aria-label="Visualizar certificado"
                    >
                      <i className="bi bi-eye"></i>
                    </Link>
                    <Botao
                      variante="outline-danger"
                      tamanho="sm"
                      icone="bi-trash"
                      onClick={() => setParaExcluir(certificado)}
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
        aberto={modalEmissao}
        titulo="Emitir certificado"
        icone="bi-award"
        aoFechar={() => setModalEmissao(false)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setModalEmissao(false)}>
              Cancelar
            </Botao>
            <Botao variante="success" icone="bi-award" onClick={emitir}>
              Emitir
            </Botao>
          </>
        }
      >
        {erro && <Alerta tipo="danger">{erro}</Alerta>}

        <div className="row g-3">
          <CampoSelect
            className="col-12"
            label="Aluno"
            name="idUsuario"
            value={formEmissao.idUsuario}
            onChange={(evento) =>
              setFormEmissao((anterior) => ({
                ...anterior,
                idUsuario: evento.target.value,
              }))
            }
            opcoes={usuarios
              .filter((usuario) => usuario.perfil === 'Aluno')
              .map((aluno) => ({
                label: aluno.nomeCompleto,
                value: aluno.id as string,
              }))}
          />

          <CampoSelect
            className="col-12"
            label="Curso concluído"
            name="idCurso"
            value={formEmissao.idCurso}
            onChange={(evento) =>
              setFormEmissao((anterior) => ({
                ...anterior,
                idCurso: evento.target.value,
              }))
            }
            opcoes={cursos.map((curso) => ({
              label: curso.titulo,
              value: curso.id as string,
            }))}
          />

          <CampoSelect
            className="col-12"
            label="Trilha (opcional)"
            name="idTrilha"
            value={formEmissao.idTrilha}
            onChange={(evento) =>
              setFormEmissao((anterior) => ({
                ...anterior,
                idTrilha: evento.target.value,
              }))
            }
            opcoes={trilhas.map((trilha) => ({
              label: trilha.titulo,
              value: trilha.id as string,
            }))}
            placeholder="Sem trilha vinculada"
            ajuda="Use quando o curso faz parte de uma trilha concluída."
          />

          <div className="col-12">
            <p className="small text-body-secondary mb-0">
              <i className="bi bi-info-circle me-2"></i>
              O código de verificação é gerado automaticamente na emissão.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        aberto={paraExcluir !== null}
        titulo="Revogar certificado"
        icone="bi-exclamation-triangle"
        aoFechar={() => setParaExcluir(null)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setParaExcluir(null)}>
              Cancelar
            </Botao>
            <Botao variante="danger" icone="bi-trash" onClick={confirmarExclusao}>
              Revogar
            </Botao>
          </>
        }
      >
        <p className="mb-0">
          Deseja revogar o certificado{' '}
          <strong className="font-monospace">
            {paraExcluir?.codigoVerificacao}
          </strong>
          ? O código deixará de ser válido na verificação.
        </p>
      </Modal>
    </div>
  );
}
