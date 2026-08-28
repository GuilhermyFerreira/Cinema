import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  titulo: string;
  descricao?: string;
  icone?: string;
  textoBotao?: string;
  linkBotao?: string;
  acoes?: React.ReactNode;
}

/** Cabeçalho padrão das páginas, com título, descrição e ação principal. */
export function Cabecalho({
  titulo,
  descricao,
  icone,
  textoBotao,
  linkBotao,
  acoes,
}: Props) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
      <div>
        <h2 className="mb-1">
          {icone && <i className={`bi ${icone} me-2 text-primary`}></i>}
          {titulo}
        </h2>
        {descricao && <p className="text-body-secondary mb-0">{descricao}</p>}
      </div>

      <div className="d-flex gap-2">
        {acoes}
        {textoBotao && linkBotao && (
          <Link to={linkBotao} className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            {textoBotao}
          </Link>
        )}
      </div>
    </div>
  );
}
