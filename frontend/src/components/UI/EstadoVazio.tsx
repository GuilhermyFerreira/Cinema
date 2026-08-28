import React from 'react';

interface Props {
  mensagem: string;
  icone?: string;
  acao?: React.ReactNode;
}

/** Mensagem exibida quando uma listagem não possui registros. */
export function EstadoVazio({
  mensagem,
  icone = 'bi-inbox',
  acao,
}: Props) {
  return (
    <div className="text-center py-5 border rounded-3 border-secondary-subtle">
      <i className={`bi ${icone} display-4 text-body-secondary d-block mb-3`}></i>
      <p className="text-body-secondary fs-5 mb-3">{mensagem}</p>
      {acao}
    </div>
  );
}
