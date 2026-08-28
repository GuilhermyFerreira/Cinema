import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { matriculaService, usuarioService, cursoService } from '../services';
import { matriculaSchema, type IUsuario, type ICurso } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { extrairErros } from '../utils/validacao';
import { hojeInputData } from '../utils/formatadores';

/** Simulação do ato de matrícula de um aluno em um curso. */
export function MatriculaForm() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();

  const [dados, setDados] = useState({
    idUsuario: '',
    idCurso: parametros.get('curso') ?? '',
    dataMatricula: hojeInputData(),
    dataConclusao: '',
  });
  const [alunos, setAlunos] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [listaAlunos, listaCursos] = await Promise.all([
          usuarioService.listarPorPerfil('Aluno'),
          cursoService.listar(),
        ]);
        setAlunos(listaAlunos);
        setCursos(listaCursos);
      } catch (erro) {
        console.error('Erro ao carregar dados da matrícula:', erro);
        setErroGeral('Não foi possível carregar alunos e cursos.');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function aoMudar(
    evento: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral('');
    setSalvando(true);

    try {
      const validado = matriculaSchema.parse({
        ...dados,
        dataConclusao: dados.dataConclusao || null,
      });

      const duplicada = await matriculaService.jaMatriculado(
        validado.idUsuario,
        validado.idCurso,
      );
      if (duplicada) {
        setErros({ idCurso: 'Este aluno já está matriculado neste curso.' });
        return;
      }

      await matriculaService.criar(validado);
      navegar('/matriculas');
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar matrícula:', erro);
        setErroGeral('Não foi possível registrar a matrícula.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  const cursoSelecionado = cursos.find((curso) => curso.id === dados.idCurso);

  return (
    <div>
      <Cabecalho
        titulo="Nova matrícula"
        descricao="Vincula um aluno a um curso do catálogo."
        icone="bi-card-checklist"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      {alunos.length === 0 && (
        <Alerta tipo="warning">
          Nenhum usuário com perfil <strong>Aluno</strong> cadastrado ainda.
        </Alerta>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={aoEnviar} className="row g-3" noValidate>
                <CampoSelect
                  className="col-md-6"
                  label="Aluno"
                  name="idUsuario"
                  value={dados.idUsuario}
                  onChange={aoMudar}
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
                  onChange={aoMudar}
                  erro={erros.idCurso}
                  opcoes={cursos.map((curso) => ({
                    label: `${curso.titulo} (${curso.nivel})`,
                    value: curso.id as string,
                  }))}
                />

                <CampoTexto
                  className="col-md-6"
                  label="Data da matrícula"
                  name="dataMatricula"
                  type="date"
                  value={dados.dataMatricula}
                  onChange={aoMudar}
                  erro={erros.dataMatricula}
                />

                <CampoTexto
                  className="col-md-6"
                  label="Data de conclusão"
                  name="dataConclusao"
                  type="date"
                  value={dados.dataConclusao}
                  onChange={aoMudar}
                  erro={erros.dataConclusao}
                  ajuda="Opcional — pode ser preenchida depois."
                />

                <div className="col-12 d-flex gap-2 pt-3 border-top">
                  <Botao
                    type="submit"
                    variante="success"
                    icone="bi-check-lg"
                    disabled={salvando}
                  >
                    {salvando ? 'Matriculando...' : 'Confirmar matrícula'}
                  </Botao>
                  <Botao
                    variante="secondary"
                    onClick={() => navegar('/matriculas')}
                  >
                    Cancelar
                  </Botao>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Resumo
              </h5>
            </div>
            <div className="card-body">
              {cursoSelecionado ? (
                <>
                  <h6 className="fw-bold">{cursoSelecionado.titulo}</h6>
                  <p className="small text-body-secondary">
                    {cursoSelecionado.descricao}
                  </p>
                  <ul className="list-unstyled small mb-0">
                    <li className="mb-2">
                      <i className="bi bi-bar-chart me-2"></i>
                      Nível: <strong>{cursoSelecionado.nivel}</strong>
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-collection-play me-2"></i>
                      {cursoSelecionado.totalAulas} aulas
                    </li>
                    <li>
                      <i className="bi bi-clock me-2"></i>
                      {cursoSelecionado.totalHoras} horas
                    </li>
                  </ul>
                </>
              ) : (
                <p className="text-body-secondary small mb-0">
                  Selecione um curso para ver os detalhes.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
