import React from 'react';

interface Props {
  children: React.ReactNode;
  titulo?: string;
  subtitulo?: string;
  icone?: string;
  rodape?: React.ReactNode;
  acoesCabecalho?: React.ReactNode;
  className?: string;
}

/** Card Bootstrap com cabeçalho, corpo e rodapé opcionais. */
export function Cartao({
  children,
  titulo,
  subtitulo,
  icone,
  rodape,
  acoesCabecalho,
  className = '',
}: Props) {
  return (
    <div className={`card shadow-sm h-100 ${className}`}>
      {(titulo || acoesCabecalho) && (
        <div className="card-header d-flex justify-content-between align-items-center gap-2">
          <div>
            <h5 className="card-title mb-0 fw-semibold">
              {icone && <i className={`bi ${icone} me-2 text-primary`}></i>}
              {titulo}
            </h5>
            {subtitulo && (
              <small className="text-body-secondary">{subtitulo}</small>
            )}
          </div>
          {acoesCabecalho}
        </div>
      )}
      <div className="card-body">{children}</div>
      {rodape && <div className="card-footer bg-transparent">{rodape}</div>}
    </div>
  );
}
