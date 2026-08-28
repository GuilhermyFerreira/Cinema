import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriaService } from '../services';
import { categoriaSchema } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { extrairErros } from '../utils/validacao';

/** Cadastro e edição de categorias (tabela Categorias). */
export function CategoriaForm() {
  const navegar = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState({ nome: '', descricao: '' });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (!modoEdicao || !id) return;

    (async () => {
      try {
        const categoria = await categoriaService.obter(id);
        setDados({ nome: categoria.nome, descricao: categoria.descricao });
      } catch (erro) {
        console.error('Erro ao carregar categoria:', erro);
        setErroGeral('Não foi possível carregar a categoria para edição.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [modoEdicao, id]);

  function aoMudar(
    evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral('');
    setSalvando(true);

    try {
      const validado = categoriaSchema.parse(dados);

      // Nome é um campo Unique no modelo de dados.
      const disponivel = await categoriaService.nomeDisponivel(validado.nome, id);
      if (!disponivel) {
        setErros({ nome: 'Já existe uma categoria com este nome.' });
        return;
      }

      if (modoEdicao && id) {
        await categoriaService.atualizar(id, validado);
      } else {
        await categoriaService.criar(validado);
      }
      navegar('/categorias');
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar categoria:', erro);
        setErroGeral('Não foi possível salvar a categoria. Verifique a API.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo={modoEdicao ? 'Editar categoria' : 'Nova categoria'}
        descricao="Área de conhecimento usada para organizar cursos e trilhas."
        icone="bi-tag"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={aoEnviar} className="row g-3" noValidate>
            <CampoTexto
              className="col-12"
              label="Nome"
              name="nome"
              value={dados.nome}
              onChange={aoMudar}
              erro={erros.nome}
              placeholder="Ex.: Desenvolvimento Web"
              ajuda="O nome da categoria é único."
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
              placeholder="Descreva o que essa categoria reúne..."
            />

            <div className="col-12 d-flex gap-2 pt-3 border-top">
              <Botao
                type="submit"
                variante="success"
                icone="bi-check-lg"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar categoria'}
              </Botao>
              <Botao variante="secondary" onClick={() => navegar('/categorias')}>
                Cancelar
              </Botao>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
