import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema } from '../models';
import { useAutenticacao } from '../hooks/useAutenticacao';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { extrairErros } from '../utils/validacao';

const FORMULARIO_VAZIO = { email: '', senha: '' };

/**
 * Acesso à plataforma. Autentica em `POST /auth/login` da API NestJS, que
 * compara a senha com o hash bcrypt e devolve um token JWT válido por 1 hora.
 */
export function Login() {
  const navegar = useNavigate();
  const { state } = useLocation();
  const { entrar, autenticado } = useAutenticacao();

  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Página que o usuário tentou abrir antes de ser mandado para o login.
  const destino = (state as { de?: string } | null)?.de ?? '/';

  if (autenticado) return <Navigate to={destino} replace />;

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
      const validado = loginSchema.parse(dados);
      await entrar(validado);
      navegar(destino, { replace: true });
    } catch (erro) {
      const errosCampos = extrairErros(erro);

      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        // O serviço de autenticação já entrega a mensagem pronta.
        setErroGeral(
          erro instanceof Error ? erro.message : 'Não foi possível entrar.',
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="row justify-content-center py-4">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="text-center mb-4">
          <i className="bi bi-person-circle text-primary" style={{ fontSize: '3rem' }}></i>
          <h2 className="mt-2 mb-1">Entrar na EduPlus</h2>
          <p className="text-body-secondary mb-0">
            Acesse para gerenciar matrículas, progresso e assinaturas.
          </p>
        </div>

        {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={aoEnviar} className="row g-3" noValidate>
              <CampoTexto
                className="col-12"
                label="E-mail"
                name="email"
                type="email"
                value={dados.email}
                onChange={aoMudar}
                erro={erros.email}
                placeholder="nome@exemplo.com"
                disabled={enviando}
              />

              <CampoTexto
                className="col-12"
                label="Senha"
                name="senha"
                type="password"
                value={dados.senha}
                onChange={aoMudar}
                erro={erros.senha}
                placeholder="Sua senha"
                disabled={enviando}
              />

              <div className="col-12 pt-2">
                <Botao
                  type="submit"
                  variante="primary"
                  icone="bi-box-arrow-in-right"
                  larguraTotal
                  disabled={enviando}
                >
                  {enviando ? 'Entrando...' : 'Entrar'}
                </Botao>
              </div>
            </form>
          </div>

          <div className="card-footer bg-transparent text-center py-3">
            <span className="text-body-secondary">Ainda não tem conta? </span>
            <Link to="/cadastro">Criar conta</Link>
          </div>
        </div>

        <p className="text-body-secondary small text-center mt-3 mb-0">
          <i className="bi bi-shield-lock me-1"></i>
          O login usa a API NestJS com JWT. Ela precisa estar rodando em{' '}
          <code>localhost:3000</code>.
        </p>
      </div>
    </section>
  );
}
