import { Link } from 'react-router-dom';

/** Página exibida para rotas inexistentes. */
export function NaoEncontrado() {
  return (
    <div className="text-center py-5">
      <i className="bi bi-compass display-1 text-body-secondary d-block mb-3"></i>
      <h2 className="mb-2">Página não encontrada</h2>
      <p className="text-body-secondary mb-4">
        O endereço acessado não existe nesta plataforma.
      </p>
      <Link to="/" className="btn btn-primary">
        <i className="bi bi-house-door me-2"></i>Voltar ao início
      </Link>
    </div>
  );
}
