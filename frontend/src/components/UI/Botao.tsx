import React from 'react';

type Variante =
  | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  | 'light' | 'dark' | 'link'
  | 'outline-primary' | 'outline-secondary' | 'outline-success'
  | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variante?: Variante;
  tamanho?: 'sm' | 'lg';
  icone?: string;
  larguraTotal?: boolean;
  className?: string;
}

/** Botão Bootstrap com suporte a ícone do Bootstrap Icons. */
export function Botao({
  children,
  variante = 'primary',
  tamanho,
  icone,
  larguraTotal = false,
  className = '',
  type = 'button',
  ...props
}: Props) {
  const classes = [
    'btn',
    `btn-${variante}`,
    tamanho ? `btn-${tamanho}` : '',
    larguraTotal ? 'w-100' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {icone && <i className={`bi ${icone} ${children ? 'me-2' : ''}`}></i>}
      {children}
    </button>
  );
}
