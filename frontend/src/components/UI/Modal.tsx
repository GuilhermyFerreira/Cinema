import React, { useEffect } from 'react';

interface Props {
  aberto: boolean;
  titulo: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  icone?: string;
  tamanho?: 'sm' | 'lg' | 'xl';
  aoFechar: () => void;
}

/**
 * Modal Bootstrap controlado por estado do React, sem depender do JavaScript
 * do Bootstrap. Fecha ao clicar no backdrop ou pressionar Esc.
 */
export function Modal({
  aberto,
  titulo,
  children,
  rodape,
  icone,
  tamanho,
  aoFechar,
}: Props) {
  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') aoFechar();
    }

    document.addEventListener('keydown', aoPressionarTecla);
    document.body.classList.add('overflow-hidden');

    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      document.body.classList.remove('overflow-hidden');
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const classeTamanho = tamanho ? `modal-${tamanho}` : '';

  return (
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        onClick={aoFechar}
      >
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${classeTamanho}`}
          onClick={(evento) => evento.stopPropagation()}
        >
          <div className="modal-content shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                {icone && <i className={`bi ${icone} me-2 text-primary`}></i>}
                {titulo}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={aoFechar}
              ></button>
            </div>
            <div className="modal-body">{children}</div>
            {rodape && <div className="modal-footer">{rodape}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
