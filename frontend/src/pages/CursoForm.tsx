import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cursoService, categoriaService, usuarioService } from '../services';
import { cursoSchema, NIVEIS } from '../models';
import type { ICategoria, IUsuario } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { extrairErros } from '../utils/validacao';
import { hojeInputData, paraInputData } from '../utils/formatadores';

const FORMULARIO_VAZIO = {
  titulo: '',
  descricao: '',
  idInstrutor: '',
  idCategoria: '',
  nivel: 'Iniciante',
  dataPublicacao: hojeInputData(),
  totalAulas: '0',
  totalHoras: '0',
};

/** Cadastro e edição de cursos (tabela Cursos). */
export function CursoForm() {
  const navegar = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [instrutores, setInstrutores] = useState<IUsuario[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [listaCategorias, listaInstrutores] = await Promise.all([
          categoriaService.listar(),
          usuarioService.listarPorPerfil('Instrutor'),
        ]);
        setCategorias(listaCategorias);
        setInstrutores(listaInstrutores);

        if (modoEdicao && id) {
          const curso = await cursoService.obter(id);
          setDados({
            titulo: curso.titulo,
            descricao: curso.descricao,
            idInstrutor: curso.idInstrutor,
            idCategoria: curso.idCategoria,
            nivel: curso.nivel,
            dataPublicacao: paraInputData(curso.dataPublicacao),
            totalAulas: String(curso.totalAulas),
            totalHoras: String(curso.totalHoras),
          });
        }
      } catch (erro) {
        console.error('Erro ao carregar dados do curso:', erro);
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
      const validado = cursoSchema.parse(dados);

      if (modoEdicao && id) {
        await cursoService.atualizar(id, validado);
        navegar(`/cursos/${id}`);
      } else {
        const criado = await cursoService.criar(validado);
        navegar(`/cursos/${criado.id}`);
      }
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar curso:', erro);
        setErroGeral('Não foi possível salvar o curso. Verifique a API.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo={modoEdicao ? 'Editar curso' : 'Novo curso'}
        descricao="Após salvar, monte a estrutura de módulos e aulas na página do curso."
        icone="bi-journal-plus"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      {instrutores.length === 0 && (
        <Alerta tipo="warning">
          Nenhum usuário com perfil <strong>Instrutor</strong> foi cadastrado
          ainda. Cadastre um instrutor antes de criar cursos.
        </Alerta>
      )}

      {categorias.length === 0 && (
        <Alerta tipo="warning">
          Nenhuma <strong>categoria</strong> cadastrada. Todo curso precisa
          pertencer a uma categoria.
        </Alerta>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={aoEnviar} className="row g-3" noValidate>
            <CampoTexto
              className="col-12"
              label="Título"
              name="titulo"
              value={dados.titulo}
              onChange={aoMudar}
              erro={erros.titulo}
              placeholder="Ex.: React do zero ao avançado"
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
              placeholder="O que o aluno vai aprender neste curso..."
            />

            <CampoSelect
              className="col-md-6"
              label="Instrutor"
              name="idInstrutor"
              value={dados.idInstrutor}
              onChange={aoMudar}
              erro={erros.idInstrutor}
              opcoes={instrutores.map((instrutor) => ({
                label: instrutor.nomeCompleto,
                value: instrutor.id as string,
              }))}
              placeholder="Selecione o instrutor..."
            />

            <CampoSelect
              className="col-md-6"
              label="Categoria"
              name="idCategoria"
              value={dados.idCategoria}
              onChange={aoMudar}
              erro={erros.idCategoria}
              opcoes={categorias.map((categoria) => ({
                label: categoria.nome,
                value: categoria.id as string,
              }))}
              placeholder="Selecione a categoria..."
            />

            <CampoSelect
              className="col-md-3"
              label="Nível"
              name="nivel"
              value={dados.nivel}
              onChange={aoMudar}
              erro={erros.nivel}
              opcoes={NIVEIS.map((nivel) => ({ label: nivel, value: nivel }))}
            />

            <CampoTexto
              className="col-md-3"
              label="Data de publicação"
              name="dataPublicacao"
              type="date"
              value={dados.dataPublicacao}
              onChange={aoMudar}
              erro={erros.dataPublicacao}
            />

            <CampoTexto
              className="col-md-3"
              label="Total de aulas"
              name="totalAulas"
              type="number"
              min={0}
              value={dados.totalAulas}
              onChange={aoMudar}
              erro={erros.totalAulas}
            />

            <CampoTexto
              className="col-md-3"
              label="Total de horas"
              name="totalHoras"
              type="number"
              min={0}
              value={dados.totalHoras}
              onChange={aoMudar}
              erro={erros.totalHoras}
            />

            <div className="col-12 d-flex gap-2 pt-3 border-top">
              <Botao
                type="submit"
                variante="success"
                icone="bi-check-lg"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar curso'}
              </Botao>
              <Botao variante="secondary" onClick={() => navegar('/cursos')}>
                Cancelar
              </Botao>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
