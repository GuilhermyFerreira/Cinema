interface Props {
  concluidas: number;
  total: number;
  altura?: number;
  mostrarRotulo?: boolean;
}

/** Progress bar Bootstrap usada no acompanhamento de aulas concluídas. */
export function BarraProgresso({
  concluidas,
  total,
  altura = 8,
  mostrarRotulo = true,
}: Props) {
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const cor = percentual === 100 ? 'bg-success' : 'bg-primary';

  return (
    <div>
      {mostrarRotulo && (
        <div className="d-flex justify-content-between small mb-1">
          <span className="text-body-secondary">
            {concluidas} de {total} aulas
          </span>
          <span className="fw-semibold">{percentual}%</span>
        </div>
      )}
      <div className="progress" style={{ height: `${altura}px` }}>
        <div
          className={`progress-bar ${cor}`}
          role="progressbar"
          style={{ width: `${percentual}%` }}
          aria-valuenow={percentual}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
}
