type Cor =
  | 'primary' | 'secondary' | 'success' | 'danger'
  | 'warning' | 'info' | 'light' | 'dark';

interface Props {
  texto: string;
  cor?: Cor;
  icone?: string;
  contorno?: boolean;
}

/** Badge Bootstrap usado para status, níveis e tipos de conteúdo. */
export function Selo({ texto, cor = 'secondary', icone, contorno = false }: Props) {
  const classes = contorno
    ? `badge border border-${cor} text-${cor}`
    : `badge text-bg-${cor}`;

  return (
    <span className={classes}>
      {icone && <i className={`bi ${icone} me-1`}></i>}
      {texto}
    </span>
  );
}
