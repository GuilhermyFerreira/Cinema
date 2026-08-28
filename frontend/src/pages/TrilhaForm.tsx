import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trilhaService, categoriaService } from '../services';
import { trilhaSchema, type ICategoria } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { extrairErros } from '../utils/validacao';

/** Cadastro e edição de trilhas (tabela Trilhas). */
export function TrilhaForm() {
  const navegar = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState({
    titulo: '',
    descricao: '',
    idCategoria: '',
  });
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setCategorias(await categoriaService.listar());

        if (modoEdicao && id) {
          const trilha = await trilhaService.obter(id);
          setDados({
            titulo: trilha.titulo,
            descricao: trilha.descricao,
            idCategoria: trilha.idCategoria,
          });
        }
      } catch (erro) {
        console.error('Erro ao carregar trilha:', erro);
        setErroGeral('Não foi possível carregar os dados do formulário.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [modoEdicao, id]);

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
      const validado = trilhaSchema.parse(dados);

      if (modoEdicao && id) {
        await trilhaService.atualizar(id, validado);
        navegar(`/trilhas/${id}`);
      } else {
        const criada = await trilhaService.criar(validado);
        navegar(`/trilhas/${criada.id}`);
      }
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar trilha:', erro);
        setErroGeral('Não foi possível salvar a trilha. Verifique a API.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo={modoEdicao ? 'Editar trilha' : 'Nova trilha'}
        descricao="Depois de salvar, defina a sequência de cursos na página da trilha."
        icone="bi-signpost-split"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={aoEnviar} className="row g-3" noValidate>
            <CampoTexto
              className="col-md-8"
              label="Título"
              name="titulo"
              value={dados.titulo}
              onChange={aoMudar}
              erro={erros.titulo}
              placeholder="Ex.: Formação Full Stack"
            />

            <CampoSelect
              className="col-md-4"
              label="Categoria"
              name="idCategoria"
              value={dados.idCategoria}
              onChange={aoMudar}
              erro={erros.idCategoria}
              opcoes={categorias.map((categoria) => ({
                label: categoria.nome,
                value: categoria.id as string,
              }))}
            />

            <CampoTexto
              className="col-12"
              label="Descrição"
              name="descricao"
              textarea
              rows={4}
              value={dados.descricao}
              onChange={aoMudar}
              erro={erros.descricao}
              placeholder="Qual caminho de aprendizagem esta trilha propõe..."
            />

            <div className="col-12 d-flex gap-2 pt-3 border-top">
              <Botao
                type="submit"
                variante="success"
                icone="bi-check-lg"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar trilha'}
              </Botao>
              <Botao variante="secondary" onClick={() => navegar('/trilhas')}>
                Cancelar
              </Botao>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
