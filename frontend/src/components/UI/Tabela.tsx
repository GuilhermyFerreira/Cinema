import React from 'react';

interface Props {
  colunas: string[];
  children: React.ReactNode;
  className?: string;
}

/** Tabela Bootstrap responsiva com cabeçalho padronizado. */
export function Tabela({ colunas, children, className = '' }: Props) {
  return (
    <div className="table-responsive">
      <table className={`table table-hover align-middle mb-0 ${className}`}>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna} scope="col" className="text-uppercase small">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
