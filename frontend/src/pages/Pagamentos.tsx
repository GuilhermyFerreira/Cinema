import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  pagamentoService,
  assinaturaService,
  usuarioService,
  planoService,
} from '../services';
import {
  METODOS_PAGAMENTO,
  type IPagamento,
  type IAssinatura,
  type IUsuario,
  type IPlano,
} from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Tabela } from '../components/UI/Tabela';
import { Selo } from '../components/UI/Selo';
import { formatarData, formatarMoeda } from '../utils/formatadores';

/** Extrato dos pagamentos registrados pelo checkout. */
export function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [assinaturas, setAssinaturas] = useState<IAssinatura[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroMetodo, setFiltroMetodo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [listaPagamentos, listaAssinaturas, listaUsuarios, listaPlanos] =
          await Promise.all([
            pagamentoService.listar(),
            assinaturaService.listar(),
            usuarioService.listar(),
            planoService.listar(),
          ]);

        setPagamentos(listaPagamentos);
        setAssinaturas(listaAssinaturas);
        setUsuarios(listaUsuarios);
        setPlanos(listaPlanos);
      } catch (erro) {
        console.error('Erro ao carregar pagamentos:', erro);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function dadosDaAssinatura(idAssinatura: string) {
    const assinatura = assinaturas.find((item) => item.id === idAssinatura);
    if (!assinatura) return { assinante: 'Assinatura removida', plano: '—' };

    return {
      assinante:
        usuarios.find((usuario) => usuario.id === assinatura.idUsuario)
          ?.nomeCompleto ?? 'Usuário removido',
      plano:
        planos.find((plano) => plano.id === assinatura.idPlano)?.nome ??
        'Plano removido',
    };
  }

  if (carregando) return <Carregando />;

  const filtrados = filtroMetodo
    ? pagamentos.filter((pagamento) => pagamento.metodoPagamento === filtroMetodo)
    : pagamentos;

  const total = filtrados.reduce((soma, item) => soma + item.valorPago, 0);

  // Distribuição por método, exibida como resumo do extrato.
  const porMetodo = METODOS_PAGAMENTO.map((metodo) => ({
    metodo,
    quantidade: pagamentos.filter((p) => p.metodoPagamento === metodo).length,
  })).filter((item) => item.quantidade > 0);

  return (
    <div>
      <Cabecalho
        titulo="Pagamentos"
        descricao="Transações geradas no checkout, com método e ID do gateway."
        icone="bi-cash-coin"
        acoes={
          <Link to="/checkout" className="btn btn-primary">
            <i className="bi bi-bag-check me-2"></i>Novo pagamento
          </Link>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <i className="bi bi-graph-up-arrow fs-2 text-success"></i>
              <div>
                <div className="fs-4 fw-bold">{formatarMoeda(total)}</div>
                <div className="small text-body-secondary">
                  Total ({filtrados.length} transações)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <small className="text-body-secondary d-block mb-2">
                Distribuição por método
              </small>
              <div className="d-flex flex-wrap gap-2">
                {porMetodo.length ? (
                  porMetodo.map((item) => (
                    <Selo
                      key={item.metodo}
                      texto={`${item.metodo}: ${item.quantidade}`}
                      cor="info"
                      contorno
                    />
                  ))
                ) : (
                  <span className="text-body-secondary small">
                    Nenhuma transação registrada.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 d-flex align-items-end">
          <select
            className="form-select"
            value={filtroMetodo}
            onChange={(evento) => setFiltroMetodo(evento.target.value)}
            aria-label="Filtrar por método de pagamento"
          >
            <option value="">Todos os métodos</option>
            {METODOS_PAGAMENTO.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhum pagamento registrado."
          icone="bi-cash-coin"
          acao={
            <Link to="/checkout" className="btn btn-primary">
              Simular um pagamento
            </Link>
          }
        />
      ) : (
        <div className="card shadow-sm">
          <Tabela
            colunas={['Assinante', 'Plano', 'Valor', 'Data', 'Método', 'ID da transação']}
          >
            {filtrados.map((pagamento) => {
              const { assinante, plano } = dadosDaAssinatura(pagamento.idAssinatura);

              return (
                <tr key={pagamento.id}>
                  <td className="fw-semibold">{assinante}</td>
                  <td>{plano}</td>
                  <td className="fw-bold text-success">
                    {formatarMoeda(pagamento.valorPago)}
                  </td>
                  <td>{formatarData(pagamento.dataPagamento)}</td>
                  <td>
                    <Selo texto={pagamento.metodoPagamento} cor="info" contorno />
                  </td>
                  <td className="font-monospace small text-body-secondary">
                    {pagamento.idTransacaoGateway}
                  </td>
                </tr>
              );
            })}
          </Tabela>
        </div>
      )}
    </div>
  );
}
