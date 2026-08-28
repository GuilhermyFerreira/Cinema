import React from 'react';

export interface Opcao {
  label: string;
  value: string | number;
}

interface Props {
  label: string;
  name: string;
  value: string | number;
  onChange: (evento: React.ChangeEvent<HTMLSelectElement>) => void;
  opcoes: Opcao[];
  erro?: string;
  placeholder?: string;
  ajuda?: string;
  disabled?: boolean;
  className?: string;
}

/** Select Bootstrap usado para todas as chaves estrangeiras e enumerações. */
export function CampoSelect({
  label,
  name,
  value,
  onChange,
  opcoes,
  erro,
  placeholder = 'Selecione...',
  ajuda,
  disabled = false,
  className = '',
}: Props) {
  const id = `select-${name}`;
  const classes = `form-select ${erro ? 'is-invalid' : ''}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>

      <select
        id={id}
        name={name}
        className={classes}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.value} value={opcao.value}>
            {opcao.label}
          </option>
        ))}
      </select>

      {erro && <div className="invalid-feedback">{erro}</div>}
      {!erro && ajuda && <div className="form-text">{ajuda}</div>}
    </div>
  );
}
