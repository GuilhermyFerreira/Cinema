interface Props {
  mensagem?: string;
}

/** Indicador de carregamento exibido enquanto a API responde. */
export function Carregando({ mensagem = 'Carregando dados...' }: Props) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Carregando</span>
      </div>
      <p className="mt-3 text-body-secondary">{mensagem}</p>
    </div>
  );
}
