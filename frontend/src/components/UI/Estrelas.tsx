interface Props {
  nota: number;
  mostrarValor?: boolean;
}

/** Exibe uma nota de 1 a 5 usando ícones de estrela. */
export function Estrelas({ nota, mostrarValor = true }: Props) {
  return (
    <span className="text-warning">
      {[1, 2, 3, 4, 5].map((posicao) => (
        <i
          key={posicao}
          className={`bi ${posicao <= Math.round(nota) ? 'bi-star-fill' : 'bi-star'}`}
        ></i>
      ))}
      {mostrarValor && (
        <span className="ms-2 text-body-secondary small">
          {nota.toFixed(1)}
        </span>
      )}
    </span>
  );
}
