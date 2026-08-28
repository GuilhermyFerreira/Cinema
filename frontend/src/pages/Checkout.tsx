import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  planoService,
  usuarioService,
  assinaturaService,
  pagamentoService,
} from '../services';
import {
  METODOS_PAGAMENTO,
  type IPlano,
  type IUsuario,
  type IAssinatura,
  type IPagamento,
  type MetodoPagamento,
} from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { Selo } from '../components/UI/Selo';
import { CartaoPlano } from '../components/Planos/CartaoPlano';
import { CampoSelect } from '../components/Formulario/CampoSelect';
import {
  formatarMoeda,
  formatarData,
  hojeInputData,
  somarMeses,
} from '../utils/formatadores';
import { gerarIdTransacao } from '../utils/geradores';

interface Comprovante {
  assinatura: IAssinatura;
  pagamento: IPagamento;
  plano: IPlano;
  assinante: IUsuario;
}

/**
 * Fluxo de checkout em três etapas: escolha do plano, identificação do
 * assinante e pagamento simulado. A confirmação grava uma Assinatura e um
 * Pagamento com método e ID de transação do gateway.
 */
export function Checkout() {
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [etapa, setEtapa] = useState(1);
  const [planoEscolhido, setPlanoEscolhido] = useState<IPlano | null>(null);
  const [idUsuario, setIdUsuario] = useState('');
  const [metodo, setMetodo] = useState<MetodoPagamento>('Cartão de Crédito');

  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [listaPlanos, listaUsuarios] = await Promise.all([
          planoService.listarOrdenadosPorPreco(),
          usuarioService.listar(),
        ]);
        setPlanos(listaPlanos);
        setUsuarios(listaUsuarios);
      } catch (falha) {
        console.error('Erro ao carregar checkout:', falha);
        setErro('Não foi possível carregar os planos disponíveis.');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function escolherPlano(plano: IPlano) {
    setPlanoEscolhido(plano);
    setEtapa(2);
  }

  async function finalizar() {
    if (!planoEscolhido?.id || !idUsuario) {
      setErro('Selecione o plano e o assinante antes de concluir.');
      return;
    }

    setProcessando(true);
    setErro('');

    try {
      const dataInicio = hojeInputData();
      const dataFim = somarMeses(dataInicio, planoEscolhido.duracaoMeses);

      // 1. Cria a assinatura vinculando usuário e plano.
      const assinatura = await assinaturaService.criar({
        idUsuario,
        idPlano: planoEscolhido.id,
        dataInicio,
        dataFim,
      });

      // 2. Registra o pagamento simulado retornado pelo gateway.
      const pagamento = await pagamentoService.criar({
        idAssinatura: assinatura.id as string,
        valorPago: planoEscolhido.preco,
        dataPagamento: dataInicio,
        metodoPagamento: metodo,
        idTransacaoGateway: gerarIdTransacao(),
      });

      const assinante = usuarios.find((usuario) => usuario.id === idUsuario);
      setComprovante({
        assinatura,
        pagamento,
        plano: planoEscolhido,
        assinante: assinante as IUsuario,
      });
      setEtapa(4);
    } catch (falha) {
      console.error('Erro ao processar checkout:', falha);
      setErro('Não foi possível concluir o pagamento. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  }

  function reiniciar() {
    setEtapa(1);
    setPlanoEscolhido(null);
    setIdUsuario('');
    setMetodo('Cartão de Crédito');
    setComprovante(null);
    setErro('');
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Checkout de assinatura"
        descricao="Escolha um plano, identifique o assinante e simule o pagamento."
        icone="bi-bag-check"
      />

      <ol className="list-group list-group-horizontal-md mb-4 shadow-sm">
        {['Plano', 'Assinante', 'Pagamento', 'Confirmação'].map(
          (rotulo, indice) => {
            const numero = indice + 1;
            const ativa = etapa === numero;
            const concluida = etapa > numero;

            return (
              <li
                key={rotulo}
                className={`list-group-item flex-fill d-flex align-items-center gap-2 ${ativa ? 'active' : ''}`}
              >
                <span
                  className={`badge rounded-pill ${concluida ? 'text-bg-success' : ativa ? 'text-bg-light' : 'text-bg-secondary'}`}
                >
                  {concluida ? <i className="bi bi-check"></i> : numero}
                </span>
                {rotulo}
              </li>
            );
          },
        )}
      </ol>

      {erro && (
        <Alerta tipo="danger" aoFechar={() => setErro('')}>
          {erro}
        </Alerta>
      )}

      {etapa === 1 && (
        <section>
          <h4 className="mb-3">1. Escolha o seu plano</h4>

          {planos.length === 0 ? (
            <EstadoVazio
              mensagem="Nenhum plano disponível para assinatura."
              icone="bi-box-seam"
              acao={
                <Link to="/planos/novo" className="btn btn-primary">
                  Cadastrar um plano
                </Link>
              }
            />
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
              {planos.map((plano) => (
                <CartaoPlano
                  key={plano.id}
                  plano={plano}
                  selecionado={planoEscolhido?.id === plano.id}
                  aoSelecionar={escolherPlano}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {etapa === 2 && planoEscolhido && (
        <section className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">2. Quem vai assinar?</h4>

                <CampoSelect
                  label="Assinante"
                  name="idUsuario"
                  value={idUsuario}
                  onChange={(evento) => setIdUsuario(evento.target.value)}
                  opcoes={usuarios.map((usuario) => ({
                    label: `${usuario.nomeCompleto} — ${usuario.email}`,
                    value: usuario.id as string,
                  }))}
                  ajuda="A assinatura fica vinculada a este usuário."
                />

                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <Botao variante="secondary" icone="bi-arrow-left" onClick={() => setEtapa(1)}>
                    Voltar
                  </Botao>
                  <Botao
                    icone="bi-arrow-right"
                    onClick={() => (idUsuario ? setEtapa(3) : setErro('Selecione o assinante.'))}
                  >
                    Continuar
                  </Botao>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <ResumoPedido plano={planoEscolhido} />
          </div>
        </section>
      )}

      {etapa === 3 && planoEscolhido && (
        <section className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">3. Forma de pagamento</h4>

                <div className="d-flex flex-column gap-2">
                  {METODOS_PAGAMENTO.map((opcao) => (
                    <label
                      key={opcao}
                      className={`list-group-item d-flex align-items-center gap-3 rounded border p-3 ${metodo === opcao ? 'border-primary border-2' : ''}`}
                      role="button"
                    >
                      <input
                        className="form-check-input mt-0"
                        type="radio"
                        name="metodoPagamento"
                        value={opcao}
                        checked={metodo === opcao}
                        onChange={() => setMetodo(opcao)}
                      />
                      <span>
                        <i className={`bi ${iconeMetodo(opcao)} me-2 text-primary`}></i>
                        {opcao}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="alert alert-info mt-4 mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Pagamento simulado: nenhum dado real é processado. O ID da
                  transação é gerado automaticamente.
                </div>

                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <Botao variante="secondary" icone="bi-arrow-left" onClick={() => setEtapa(2)}>
                    Voltar
                  </Botao>
                  <Botao
                    variante="success"
                    icone="bi-credit-card"
                    onClick={finalizar}
                    disabled={processando}
                  >
                    {processando
                      ? 'Processando...'
                      : `Pagar ${formatarMoeda(planoEscolhido.preco)}`}
                  </Botao>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <ResumoPedido plano={planoEscolhido} metodo={metodo} />
          </div>
        </section>
      )}

      {etapa === 4 && comprovante && (
        <section className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm border-success border-2">
              <div className="card-body text-center p-4 p-md-5">
                <i className="bi bi-check-circle-fill display-1 text-success mb-3 d-block"></i>
                <h3 className="mb-2">Assinatura confirmada!</h3>
                <p className="text-body-secondary mb-4">
                  O pagamento foi registrado com sucesso.
                </p>

                <div className="row g-3 text-start">
                  <Linha rotulo="Assinante" valor={comprovante.assinante?.nomeCompleto ?? '—'} />
                  <Linha rotulo="Plano" valor={comprovante.plano.nome} />
                  <Linha
                    rotulo="Valor pago"
                    valor={formatarMoeda(comprovante.pagamento.valorPago)}
                  />
                  <Linha
                    rotulo="Método de pagamento"
                    valor={comprovante.pagamento.metodoPagamento}
                  />
                  <Linha
                    rotulo="Vigência"
                    valor={`${formatarData(comprovante.assinatura.dataInicio)} até ${formatarData(comprovante.assinatura.dataFim)}`}
                  />
                  <Linha
                    rotulo="ID da transação"
                    valor={comprovante.pagamento.idTransacaoGateway}
                    monoespacado
                  />
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-2 mt-4 pt-4 border-top">
                  <Link to="/assinaturas" className="btn btn-primary">
                    <i className="bi bi-arrow-repeat me-2"></i>Ver assinaturas
                  </Link>
                  <Link to="/pagamentos" className="btn btn-outline-primary">
                    <i className="bi bi-cash-coin me-2"></i>Ver pagamentos
                  </Link>
                  <Botao variante="outline-secondary" icone="bi-plus-lg" onClick={reiniciar}>
                    Nova assinatura
                  </Botao>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function iconeMetodo(metodo: MetodoPagamento): string {
  return {
    'Cartão de Crédito': 'bi-credit-card',
    'Cartão de Débito': 'bi-credit-card-2-front',
    'Pix': 'bi-qr-code',
    'Boleto': 'bi-upc-scan',
  }[metodo];
}

function ResumoPedido({
  plano,
  metodo,
}: {
  plano: IPlano;
  metodo?: MetodoPagamento;
}) {
  const dataInicio = hojeInputData();
  const dataFim = somarMeses(dataInicio, plano.duracaoMeses);

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-receipt me-2 text-primary"></i>Resumo do pedido
        </h5>
      </div>
      <div className="card-body">
        <h6 className="fw-bold">{plano.nome}</h6>
        <p className="small text-body-secondary">{plano.descricao}</p>

        <ul className="list-unstyled small mb-3">
          <li className="d-flex justify-content-between py-1">
            <span className="text-body-secondary">Duração</span>
            <strong>{plano.duracaoMeses} meses</strong>
          </li>
          <li className="d-flex justify-content-between py-1">
            <span className="text-body-secondary">Vigência</span>
            <strong>
              {formatarData(dataInicio)} — {formatarData(dataFim)}
            </strong>
          </li>
          {metodo && (
            <li className="d-flex justify-content-between py-1">
              <span className="text-body-secondary">Pagamento</span>
              <Selo texto={metodo} cor="info" contorno />
            </li>
          )}
        </ul>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <span className="fw-semibold">Total</span>
          <span className="fs-4 fw-bold text-primary">
            {formatarMoeda(plano.preco)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Linha({
  rotulo,
  valor,
  monoespacado = false,
}: {
  rotulo: string;
  valor: string;
  monoespacado?: boolean;
}) {
  return (
    <div className="col-sm-6">
      <small className="text-body-secondary d-block">{rotulo}</small>
      <strong className={monoespacado ? 'font-monospace' : ''}>{valor}</strong>
    </div>
  );
}
