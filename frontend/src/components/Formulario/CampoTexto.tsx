import React from 'react';

interface Props {
  label: string;
  name: string;
  value: string | number;
  onChange: (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  erro?: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'email' | 'password' | 'url';
  textarea?: boolean;
  rows?: number;
  step?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  ajuda?: string;
  disabled?: boolean;
  className?: string;
}

/** Campo de texto Bootstrap com rótulo, validação visual e texto de ajuda. */
export function CampoTexto({
  label,
  name,
  value,
  onChange,
  erro,
  type = 'text',
  textarea = false,
  rows = 3,
  step,
  min,
  max,
  placeholder,
  ajuda,
  disabled = false,
  className = '',
}: Props) {
  const id = `campo-${name}`;
  const classes = `form-control ${erro ? 'is-invalid' : ''}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>

      {textarea ? (
        <textarea
          id={id}
          name={name}
          className={classes}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          className={classes}
          value={value}
          onChange={onChange}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {erro && <div className="invalid-feedback">{erro}</div>}
      {!erro && ajuda && <div className="form-text">{ajuda}</div>}
    </div>
  );
}
