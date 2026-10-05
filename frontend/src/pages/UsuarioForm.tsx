import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usuarioService } from '../services';
import { usuarioSchema, usuarioEdicaoSchema, PAPEIS, type Papel } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import { extrairErros } from '../utils/validacao';

const FORMULARIO_VAZIO = {
  nomeCompleto: '',
  email: '',
  senha: '',
};

/**
 * Cadastro e edição de usuários.
 *
 * A senha nunca volta da API — só o hash fica no banco. Por isso, na edição o
 * campo começa vazio e só é enviado quando preenchido.
 *
 * O papel também não trafega junto do cadastro: ele tem uma rota própria
 * (`PATCH /usuarios/:id/papel`), porque o autocadastro é público e aceitar o
 * papel ali permitiria que qualquer visitante criasse um administrador.
 */
export function UsuarioForm() {
  const navegar = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [papel, setPapel] = useState<Papel>('Aluno');
  const [papelOriginal, setPapelOriginal] = useState<Papel>('Aluno');
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
          senha: '',
        });
        setPapel(usuario.papel);
        setPapelOriginal(usuario.papel);
      } catch (erro) {
        console.error('Erro ao carregar usuário:', erro);
        setErroGeral('Não foi possível carregar o usuário para edição.');
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
    setErros({});
    setSalvando(true);

    try {
      const esquema = modoEdicao ? usuarioEdicaoSchema : usuarioSchema;
      const validado = esquema.parse(dados);

      const disponivel = await usuarioService.emailDisponivel(
        validado.email,
        id,
      );
      if (!disponivel) {
        setErros({ email: 'Este e-mail já está cadastrado.' });
        return;
      }

      if (modoEdicao && id) {
        // Senha em branco significa "manter a atual".
        const { senha, ...resto } = validado;
        await usuarioService.atualizar(id, senha ? { ...resto, senha } : resto);

        if (papel !== papelOriginal) {
          await usuarioService.alterarPapel(id, papel);
        }
      } else {
        await usuarioService.criar({ ...validado, papel: 'Aluno' });
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
        descricao="Dados de acesso e nível de permissão na plataforma."
        icone="bi-person-plus"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={aoEnviar} className="row g-3" noValidate>
            <CampoTexto
              className={modoEdicao ? 'col-md-8' : 'col-12'}
              label="Nome completo"
              name="nomeCompleto"
              value={dados.nomeCompleto}
              onChange={aoMudar}
              erro={erros.nomeCompleto}
              placeholder="Ex.: Ana Beatriz Souza"
            />

            {modoEdicao && (
              <CampoSelect
                className="col-md-4"
                label="Papel"
                name="papel"
                value={papel}
                onChange={(evento) => setPapel(evento.target.value as Papel)}
                opcoes={PAPEIS.map((p) => ({ label: p, value: p }))}
                ajuda="Admin administra o catálogo; Aluno se matricula e assina."
              />
            )}

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
              label={modoEdicao ? 'Nova senha' : 'Senha'}
              name="senha"
              type="password"
              value={dados.senha}
              onChange={aoMudar}
              erro={erros.senha}
              ajuda={
                modoEdicao
                  ? 'Deixe em branco para manter a senha atual.'
                  : 'Mínimo de 6 caracteres.'
              }
            />

            {!modoEdicao && (
              <div className="col-12">
                <Alerta tipo="info">
                  Todo usuário novo entra como <strong>Aluno</strong>. Para
                  promover a administrador, edite-o depois de criado.
                </Alerta>
              </div>
            )}

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
