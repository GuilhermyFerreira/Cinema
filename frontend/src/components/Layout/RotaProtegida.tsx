import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../hooks/useAutenticacao';
import type { Papel } from '../../models';

interface Props {
  /** Quando informado, além de estar logado o usuário precisa ter este papel. */
  papel?: Papel;
}

/**
 * Rota-mãe das áreas restritas.
 *
 * Sem sessão ativa, redireciona para `/login` guardando o caminho pretendido.
 * Com sessão mas sem o papel exigido, mostra um aviso em vez de mandar para o
 * login — o problema não é falta de autenticação, e sim de permissão.
 */
export function RotaProtegida({ papel }: Props) {
  const { autenticado, ehAdmin } = useAutenticacao();
  const { pathname } = useLocation();

  if (!autenticado) {
    return <Navigate to="/login" state={{ de: pathname }} replace />;
  }

  if (papel === 'Admin' && !ehAdmin) {
    return (
      <div className="py-5 text-center">
        <i className="bi bi-shield-lock display-1 text-body-secondary d-block mb-3"></i>
        <h2 className="mb-2">Acesso restrito</h2>
        <p className="text-body-secondary mb-4">
          Esta área é exclusiva de administradores. Sua conta é de aluno.
        </p>
        <a href="/meus-cursos" className="btn btn-primary">
          <i className="bi bi-journal-bookmark me-2"></i>Ir para meus cursos
        </a>
      </div>
    );
  }

  return <Outlet />;
}
