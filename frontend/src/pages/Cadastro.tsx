import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { cadastroSchema } from '../models';
import { useAutenticacao } from '../hooks/useAutenticacao';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { extrairErros } from '../utils/validacao';

const FORMULARIO_VAZIO = {
  nomeCompleto: '',
  email: '',
  senha: '',
  confirmacaoSenha: '',
};

/**
 * Autocadastro público. Cria a conta em `POST /usuarios` (a única rota aberta da
 * API além do login) e já autentica em seguida, pois o cadastro devolve o
 * usuário criado, mas não um token.
 */
export function Cadastro() {
  const navegar = useNavigate();
  const { cadastrar, autenticado } = useAutenticacao();

  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/" replace />;

  function aoMudar(evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErros({});
    setErroGeral('');
    setEnviando(true);

    try {
      const validado = cadastroSchema.parse(dados);
      await cadastrar(validado);
      navegar('/', { replace: true });
    } catch (erro) {
      const errosCampos = extrairErros(erro);

      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        setErroGeral(
          erro instanceof Error
            ? erro.message
            : 'Não foi possível criar a conta.',
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="row justify-content-center py-4">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="text-center mb-4">
          <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '3rem' }}></i>
          <h2 className="mt-2 mb-1">Criar conta</h2>
          <p className="text-body-secondary mb-0">
            Cadastre-se para acompanhar seus cursos e certificados.
          </p>
        </div>

        {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={aoEnviar} className="row g-3" noValidate>
              <CampoTexto
                className="col-12"
                label="Nome completo"
                name="nomeCompleto"
                value={dados.nomeCompleto}
                onChange={aoMudar}
                erro={erros.nomeCompleto}
                placeholder="Ex.: Ana Beatriz Souza"
                disabled={enviando}
              />

              <CampoTexto
                className="col-12"
                label="E-mail"
                name="email"
                type="email"
                value={dados.email}
                onChange={aoMudar}
                erro={erros.email}
                placeholder="nome@exemplo.com"
                ajuda="O e-mail é único em toda a plataforma."
                disabled={enviando}
              />

              <CampoTexto
                className="col-md-6"
                label="Senha"
                name="senha"
                type="password"
                value={dados.senha}
                onChange={aoMudar}
                erro={erros.senha}
                ajuda="Mínimo de 6 caracteres."
                disabled={enviando}
              />

              <CampoTexto
                className="col-md-6"
                label="Confirmar senha"
                name="confirmacaoSenha"
                type="password"
                value={dados.confirmacaoSenha}
                onChange={aoMudar}
                erro={erros.confirmacaoSenha}
                disabled={enviando}
              />

              <div className="col-12 pt-2">
                <Botao
                  type="submit"
                  variante="success"
                  icone="bi-check-lg"
                  larguraTotal
                  disabled={enviando}
                >
                  {enviando ? 'Criando conta...' : 'Criar conta e entrar'}
                </Botao>
              </div>
            </form>
          </div>

          <div className="card-footer bg-transparent text-center py-3">
            <span className="text-body-secondary">Já tem conta? </span>
            <Link to="/login">Entrar</Link>
          </div>
        </div>

        <p className="text-body-secondary small text-center mt-3 mb-0">
          <i className="bi bi-shield-lock me-1"></i>
          A senha é enviada à API NestJS, que a guarda apenas como hash bcrypt.
        </p>
      </div>
    </section>
  );
}
