interface Props {
  label: string;
  value: number;
  onChange: (nota: number) => void;
  erro?: string;
  className?: string;
}

/** Seletor de nota de 1 a 5 estrelas usado nas avaliações de curso. */
export function CampoNota({ label, value, onChange, erro, className = '' }: Props) {
  return (
    <div className={className}>
      <label className="form-label d-block">{label}</label>

      <div className="btn-group" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            type="button"
            className={`btn ${nota <= value ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => onChange(nota)}
            aria-pressed={nota <= value}
          >
            <i className={`bi ${nota <= value ? 'bi-star-fill' : 'bi-star'}`}></i>
          </button>
        ))}
      </div>

      {erro && <div className="text-danger small mt-1">{erro}</div>}
    </div>
  );
}
