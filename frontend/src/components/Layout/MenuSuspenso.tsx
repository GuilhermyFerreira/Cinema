import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface ItemMenu {
  rotulo: string;
  caminho: string;
  icone: string;
}

interface Props {
  titulo: string;
  icone: string;
  itens: ItemMenu[];
}

/**
 * Dropdown da navbar implementado em React puro com classes do Bootstrap,
 * dispensando o bundle JavaScript do Bootstrap.
 */
export function MenuSuspenso({ titulo, icone, itens }: Props) {
  const [aberto, setAberto] = useState(false);
  const referencia = useRef<HTMLLIElement>(null);
  const { pathname } = useLocation();

  // Fecha o menu ao clicar fora dele.
  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (!referencia.current?.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [aberto]);

  const grupoAtivo = itens.some((item) => pathname.startsWith(item.caminho));

  return (
    <li className="nav-item dropdown" ref={referencia}>
      <button
        type="button"
        className={`nav-link dropdown-toggle btn btn-link ${grupoAtivo ? 'active fw-semibold' : ''}`}
        aria-expanded={aberto}
        onClick={() => setAberto((estado) => !estado)}
      >
        <i className={`bi ${icone} me-1`}></i>
        {titulo}
      </button>

      <ul className={`dropdown-menu dropdown-menu-end ${aberto ? 'show' : ''}`}>
        {itens.map((item) => (
          <li key={item.caminho}>
            <Link
              className={`dropdown-item ${pathname === item.caminho ? 'active' : ''}`}
              to={item.caminho}
              onClick={() => setAberto(false)}
            >
              <i className={`bi ${item.icone} me-2`}></i>
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
