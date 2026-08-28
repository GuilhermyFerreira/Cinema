import type { IPlano } from '../../models';
import { formatarMoeda } from '../../utils/formatadores';
import { Botao } from '../UI/Botao';

interface Props {
  plano: IPlano;
  destaque?: boolean;
  selecionado?: boolean;
  textoBotao?: string;
  aoSelecionar?: (plano: IPlano) => void;
  acoes?: React.ReactNode;
}

/** Card de plano usado tanto na gestão quanto na vitrine do checkout. */
export function CartaoPlano({
  plano,
  destaque = false,
  selecionado = false,
  textoBotao = 'Escolher plano',
  aoSelecionar,
  acoes,
}: Props) {
  const mensal = plano.preco / plano.duracaoMeses;

  return (
    <div className="col">
      <div
        className={`card h-100 shadow-sm ${selecionado ? 'border-primary border-2' : ''}`}
      >
        {destaque && (
          <div className="card-header bg-primary text-white text-center fw-semibold">
            <i className="bi bi-star-fill me-2"></i>Mais escolhido
          </div>
        )}

        <div className="card-body d-flex flex-column text-center">
          <h5 className="card-title">{plano.nome}</h5>

          <p className="display-6 fw-bold mb-0">{formatarMoeda(plano.preco)}</p>
          <p className="text-body-secondary small mb-3">
            {plano.duracaoMeses} {plano.duracaoMeses === 1 ? 'mês' : 'meses'} ·
            equivale a {formatarMoeda(mensal)}/mês
          </p>

          <p className="card-text text-body-secondary small flex-grow-1">
            {plano.descricao}
          </p>

          {aoSelecionar && (
            <Botao
              variante={selecionado ? 'success' : 'outline-primary'}
              icone={selecionado ? 'bi-check-lg' : 'bi-bag-check'}
              larguraTotal
              onClick={() => aoSelecionar(plano)}
            >
              {selecionado ? 'Plano selecionado' : textoBotao}
            </Botao>
          )}

          {acoes && <div className="d-flex gap-2 mt-3">{acoes}</div>}
        </div>
      </div>
    </div>
  );
}
