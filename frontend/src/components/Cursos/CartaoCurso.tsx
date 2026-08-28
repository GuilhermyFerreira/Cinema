import { Link } from 'react-router-dom';
import type { ICurso } from '../../models';
import { Selo } from '../UI/Selo';
import { Estrelas } from '../UI/Estrelas';
import { formatarData } from '../../utils/formatadores';

interface Props {
  curso: ICurso;
  nomeCategoria: string;
  nomeInstrutor: string;
  nota?: number | null;
  aoExcluir?: (id: string) => void;
}

const COR_NIVEL = {
  'Iniciante': 'success',
  'Intermediário': 'warning',
  'Avançado': 'danger',
} as const;

/** Card de curso usado nas listagens do catálogo. */
export function CartaoCurso({
  curso,
  nomeCategoria,
  nomeInstrutor,
  nota,
  aoExcluir,
}: Props) {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <Selo texto={nomeCategoria} cor="info" contorno />
            <Selo texto={curso.nivel} cor={COR_NIVEL[curso.nivel]} />
          </div>

          <h5 className="card-title">{curso.titulo}</h5>
          <p className="card-text text-body-secondary small flex-grow-1">
            {curso.descricao}
          </p>

          <ul className="list-unstyled small text-body-secondary mb-3">
            <li>
              <i className="bi bi-person-video3 me-2"></i>
              {nomeInstrutor}
            </li>
            <li>
              <i className="bi bi-collection-play me-2"></i>
              {curso.totalAulas} aulas · {curso.totalHoras}h
            </li>
            <li>
              <i className="bi bi-calendar3 me-2"></i>
              Publicado em {formatarData(curso.dataPublicacao)}
            </li>
          </ul>

          {nota != null ? (
            <div className="mb-3">
              <Estrelas nota={nota} />
            </div>
          ) : (
            <p className="small text-body-secondary mb-3">
              <i className="bi bi-star me-2"></i>Sem avaliações
            </p>
          )}

          <div className="d-flex gap-2 mt-auto">
            <Link
              to={`/cursos/${curso.id}`}
              className="btn btn-primary btn-sm flex-grow-1"
            >
              <i className="bi bi-eye me-1"></i>Conteúdo
            </Link>
            <Link
              to={`/cursos/editar/${curso.id}`}
              className="btn btn-outline-secondary btn-sm"
              aria-label={`Editar ${curso.titulo}`}
            >
              <i className="bi bi-pencil"></i>
            </Link>
            {aoExcluir && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                aria-label={`Excluir ${curso.titulo}`}
                onClick={() => aoExcluir(curso.id as string)}
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
