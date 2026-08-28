import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  assinaturaService,
  usuarioService,
  planoService,
  pagamentoService,
} from '../services';
import type { IAssinatura, IUsuario, IPlano, IPagamento } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Tabela } from '../components/UI/Tabela';
import { Selo } from '../components/UI/Selo';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { formatarData, formatarMoeda } from '../utils/formatadores';

/** Assinaturas contratadas, com situação de vigência e total pago. */
export function Assinaturas() {
  const [assinaturas, setAssinaturas] = useState<IAssinatura[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroSituacao, setFiltroSituacao] = useState<'Todas' | 'Ativa' | 'Expirada'>('Todas');
  const [paraExcluir, setParaExcluir] = useState<IAssinatura | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaAssinaturas, listaUsuarios, listaPlanos, listaPagamentos] =
        await Promise.all([
          assinaturaService.listar(),
          usuarioService.listar(),
          planoService.listar(),
          pagamentoService.listar(),
        ]);

      setAssinaturas(listaAssinaturas);
      setUsuarios(listaUsuarios);
      setPlanos(listaPlanos);
      setPagamentos(listaPagamentos);
    } catch (erro) {
      console.error('Erro ao carregar assinaturas:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      // Remove primeiro os pagamentos que referenciam a assinatura.
      const vinculados = pagamentos.filter((p) => p.idAssinatura === paraExcluir.id);
      await Promise.all(
        vinculados.map((p) => pagamentoService.excluir(p.id as string)),
      );
      await assinaturaService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao cancelar assinatura:', erro);
    }
  }

  function nomeAssinante(idUsuario: string): string {
    return (
      usuarios.find((usuario) => usuario.id === idUsuario)?.nomeCompleto ??
      'Usuário removido'
    );
  }

  function nomePlano(idPlano: string): string {
    return planos.find((plano) => plano.id === idPlano)?.nome ?? 'Plano removido';
  }

  function totalPago(idAssinatura: string): number {
    return pagamentos
      .filter((pagamento) => pagamento.idAssinatura === idAssinatura)
      .reduce((total, pagamento) => total + pagamento.valorPago, 0);
  }

  if (carregando) return <Carregando />;

  const filtradas = assinaturas.filter((assinatura) => {
    if (filtroSituacao === 'Todas') return true;
    const ativa = assinaturaService.estaAtiva(assinatura);
    return filtroSituacao === 'Ativa' ? ativa : !ativa;
  });

  const receita = pagamentos.reduce((total, item) => total + item.valorPago, 0);
  const ativas = assinaturas.filter((a) => assinaturaService.estaAtiva(a)).length;

  return (
    <div>
      <Cabecalho
        titulo="Assinaturas"
        descricao="Contratos de acesso vinculados a um plano e a um usuário."
        icone="bi-arrow-repeat"
        acoes={
          <Link to="/checkout" className="btn btn-primary">
            <i className="bi bi-bag-check me-2"></i>Nova assinatura
          </Link>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <i className="bi bi-check-circle-fill fs-2 text-success"></i>
              <div>
                <div className="fs-4 fw-bold">{ativas}</div>
                <div className="small text-body-secondary">Assinaturas ativas</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <i className="bi bi-cash-coin fs-2 text-warning"></i>
              <div>
                <div className="fs-4 fw-bold">{formatarMoeda(receita)}</div>
                <div className="small text-body-secondary">Receita registrada</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <select
            className="form-select"
            value={filtroSituacao}
            onChange={(evento) =>
              setFiltroSituacao(evento.target.value as 'Todas' | 'Ativa' | 'Expirada')
            }
            aria-label="Filtrar por situação"
          >
            <option value="Todas">Todas as situações</option>
            <option value="Ativa">Somente ativas</option>
            <option value="Expirada">Somente expiradas</option>
          </select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhuma assinatura encontrada."
          icone="bi-arrow-repeat"
          acao={
            <Link to="/checkout" className="btn btn-primary">
              Assinar um plano
            </Link>
          }
        />
      ) : (
        <div className="card shadow-sm">
          <Tabela
            colunas={['Assinante', 'Plano', 'Início', 'Término', 'Situação', 'Pago', 'Ações']}
          >
            {filtradas.map((assinatura) => {
              const ativa = assinaturaService.estaAtiva(assinatura);

              return (
                <tr key={assinatura.id}>
                  <td className="fw-semibold">
                    {nomeAssinante(assinatura.idUsuario)}
                  </td>
                  <td>{nomePlano(assinatura.idPlano)}</td>
                  <td>{formatarData(assinatura.dataInicio)}</td>
                  <td>{formatarData(assinatura.dataFim)}</td>
                  <td>
                    <Selo
                      texto={ativa ? 'Ativa' : 'Expirada'}
                      cor={ativa ? 'success' : 'secondary'}
                      icone={ativa ? 'bi-check-circle' : 'bi-x-circle'}
                    />
                  </td>
                  <td>{formatarMoeda(totalPago(assinatura.id as string))}</td>
                  <td>
                    <Botao
                      variante="outline-danger"
                      tamanho="sm"
                      icone="bi-trash"
                      onClick={() => setParaExcluir(assinatura)}
                    >
                      {''}
                    </Botao>
                  </td>
                </tr>
              );
            })}
          </Tabela>
        </div>
      )}

      <Modal
        aberto={paraExcluir !== null}
        titulo="Cancelar assinatura"
        icone="bi-exclamation-triangle"
        aoFechar={() => setParaExcluir(null)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setParaExcluir(null)}>
              Voltar
            </Botao>
            <Botao variante="danger" icone="bi-trash" onClick={confirmarExclusao}>
              Cancelar assinatura
            </Botao>
          </>
        }
      >
        <p className="mb-0">
          Deseja cancelar a assinatura de{' '}
          <strong>{paraExcluir && nomeAssinante(paraExcluir.idUsuario)}</strong>?
          Os pagamentos vinculados também serão removidos.
        </p>
      </Modal>
    </div>
  );
}
