import { Link } from 'react-router-dom';
import type { ITrilha } from '../../models';
import { Selo } from '../UI/Selo';

interface Props {
  trilha: ITrilha;
  nomeCategoria: string;
  totalCursos: number;
  aoExcluir?: (id: string) => void;
}

/** Card de trilha de conhecimento, agregando uma sequência de cursos. */
export function CartaoTrilha({
  trilha,
  nomeCategoria,
  totalCursos,
  aoExcluir,
}: Props) {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-start border-4 border-primary">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <Selo texto={nomeCategoria} cor="info" contorno />
            <Selo
              texto={`${totalCursos} curso${totalCursos === 1 ? '' : 's'}`}
              cor="primary"
            />
          </div>

          <h5 className="card-title">
            <i className="bi bi-signpost-split me-2 text-primary"></i>
            {trilha.titulo}
          </h5>
          <p className="card-text text-body-secondary small flex-grow-1">
            {trilha.descricao}
          </p>

          <div className="d-flex gap-2 mt-auto">
            <Link
              to={`/trilhas/${trilha.id}`}
              className="btn btn-primary btn-sm flex-grow-1"
            >
              <i className="bi bi-list-ol me-1"></i>Cursos da trilha
            </Link>
            <Link
              to={`/trilhas/editar/${trilha.id}`}
              className="btn btn-outline-secondary btn-sm"
              aria-label={`Editar ${trilha.titulo}`}
            >
              <i className="bi bi-pencil"></i>
            </Link>
            {aoExcluir && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                aria-label={`Excluir ${trilha.titulo}`}
                onClick={() => aoExcluir(trilha.id as string)}
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
