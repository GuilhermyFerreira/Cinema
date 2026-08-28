import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usuarioService } from '../services';
import { usuarioSchema, PERFIS } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { extrairErros } from '../utils/validacao';
import { hojeInputData, paraInputData } from '../utils/formatadores';

const FORMULARIO_VAZIO = {
  nomeCompleto: '',
  email: '',
  senhaHash: '',
  dataCadastro: hojeInputData(),
  perfil: 'Aluno',
};

/** Cadastro e edição de usuários (tabela Usuarios). */
export function UsuarioForm() {
  const navegar = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (!modoEdicao || !id) return;

    (async () => {
      try {
        const usuario = await usuarioService.obter(id);
        setDados({
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          senhaHash: usuario.senhaHash,
          dataCadastro: paraInputData(usuario.dataCadastro),
          perfil: usuario.perfil,
        });
      } catch (erro) {
        console.error('Erro ao carregar usuário:', erro);
        setErroGeral('Não foi possível carregar o usuário para edição.');
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
      const validado = usuarioSchema.parse(dados);

      // Email é um campo Unique no modelo de dados.
      const disponivel = await usuarioService.emailDisponivel(validado.email, id);
      if (!disponivel) {
        setErros({ email: 'Este e-mail já está cadastrado.' });
        return;
      }

      if (modoEdicao && id) {
        await usuarioService.atualizar(id, validado);
      } else {
        await usuarioService.criar(validado);
      }
      navegar('/usuarios');
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar usuário:', erro);
        setErroGeral('Não foi possível salvar o usuário. Verifique a API.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo={modoEdicao ? 'Editar usuário' : 'Novo usuário'}
        descricao="Dados de acesso e identificação na plataforma."
        icone="bi-person-plus"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={aoEnviar} className="row g-3" noValidate>
            <CampoTexto
              className="col-md-8"
              label="Nome completo"
              name="nomeCompleto"
              value={dados.nomeCompleto}
              onChange={aoMudar}
              erro={erros.nomeCompleto}
              placeholder="Ex.: Ana Beatriz Souza"
            />

            <CampoSelect
              className="col-md-4"
              label="Perfil"
              name="perfil"
              value={dados.perfil}
              onChange={aoMudar}
              erro={erros.perfil}
              opcoes={PERFIS.map((perfil) => ({ label: perfil, value: perfil }))}
              ajuda="Instrutores podem ser vinculados a cursos."
            />

            <CampoTexto
              className="col-md-6"
              label="E-mail"
              name="email"
              type="email"
              value={dados.email}
              onChange={aoMudar}
              erro={erros.email}
              placeholder="nome@exemplo.com"
              ajuda="O e-mail é único em toda a plataforma."
            />

            <CampoTexto
              className="col-md-6"
              label="Senha"
              name="senhaHash"
              type="password"
              value={dados.senhaHash}
              onChange={aoMudar}
              erro={erros.senhaHash}
              ajuda="Mínimo de 6 caracteres."
            />

            <CampoTexto
              className="col-md-6"
              label="Data de cadastro"
              name="dataCadastro"
              type="date"
              value={dados.dataCadastro}
              onChange={aoMudar}
              erro={erros.dataCadastro}
            />

            <div className="col-12 d-flex gap-2 pt-3 border-top">
              <Botao
                type="submit"
                variante="success"
                icone="bi-check-lg"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar usuário'}
              </Botao>
              <Botao variante="secondary" onClick={() => navegar('/usuarios')}>
                Cancelar
              </Botao>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
