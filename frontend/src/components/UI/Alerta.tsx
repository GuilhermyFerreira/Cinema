import React from 'react';

interface Props {
  children: React.ReactNode;
  tipo?: 'success' | 'danger' | 'warning' | 'info';
  icone?: string;
  aoFechar?: () => void;
}

/** Alerta Bootstrap para mensagens de sucesso, erro e orientação. */
export function Alerta({ children, tipo = 'info', icone, aoFechar }: Props) {
  const iconePadrao = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-octagon-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  }[tipo];

  return (
    <div
      className={`alert alert-${tipo} d-flex align-items-center gap-2 ${aoFechar ? 'alert-dismissible' : ''}`}
      role="alert"
    >
      <i className={`bi ${icone ?? iconePadrao}`}></i>
      <div className="flex-grow-1">{children}</div>
      {aoFechar && (
        <button
          type="button"
          className="btn-close"
          aria-label="Fechar"
          onClick={aoFechar}
        ></button>
      )}
    </div>
  );
}
