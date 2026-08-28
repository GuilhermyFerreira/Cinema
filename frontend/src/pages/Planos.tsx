import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { planoService, assinaturaService } from '../services';
import type { IPlano, IAssinatura } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { Alerta } from '../components/UI/Alerta';
import { CartaoPlano } from '../components/Planos/CartaoPlano';

/** Gestão dos planos de assinatura oferecidos pela plataforma. */
export function Planos() {
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [assinaturas, setAssinaturas] = useState<IAssinatura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paraExcluir, setParaExcluir] = useState<IPlano | null>(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [listaPlanos, listaAssinaturas] = await Promise.all([
        planoService.listarOrdenadosPorPreco(),
        assinaturaService.listar(),
      ]);
      setPlanos(listaPlanos);
      setAssinaturas(listaAssinaturas);
    } catch (erro) {
      console.error('Erro ao carregar planos:', erro);
    } finally {
      setCarregando(false);
    }
  }

  function solicitarExclusao(plano: IPlano) {
    const vinculadas = assinaturas.filter((a) => a.idPlano === plano.id).length;
    if (vinculadas > 0) {
      setAviso(
        `O plano "${plano.nome}" possui ${vinculadas} assinatura(s) vinculada(s) e não pode ser excluído.`,
      );
      return;
    }
    setAviso('');
    setParaExcluir(plano);
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await planoService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir plano:', erro);
    }
  }

  if (carregando) return <Carregando />;

  // Destaca o plano com mais assinaturas ativas.
  const contagem = new Map<string, number>();
  assinaturas.forEach((assinatura) => {
    contagem.set(assinatura.idPlano, (contagem.get(assinatura.idPlano) ?? 0) + 1);
  });
  const idMaisPopular = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div>
      <Cabecalho
        titulo="Planos"
        descricao="Ofertas de assinatura com preço e duração em meses."
        icone="bi-box-seam"
        textoBotao="Novo plano"
        linkBotao="/planos/novo"
      />

      {aviso && (
        <Alerta tipo="warning" aoFechar={() => setAviso('')}>
          {aviso}
        </Alerta>
      )}

      {planos.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhum plano cadastrado."
          icone="bi-box-seam"
          acao={
            <Link to="/planos/novo" className="btn btn-primary">
              Cadastrar o primeiro plano
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {planos.map((plano) => (
            <CartaoPlano
              key={plano.id}
              plano={plano}
              destaque={plano.id === idMaisPopular}
              acoes={
                <>
                  <Link
                    to={`/planos/editar/${plano.id}`}
                    className="btn btn-outline-secondary btn-sm flex-grow-1"
                  >
                    <i className="bi bi-pencil me-1"></i>Editar
                  </Link>
                  <Botao
                    variante="outline-danger"
                    tamanho="sm"
                    icone="bi-trash"
                    onClick={() => solicitarExclusao(plano)}
                  >
                    {''}
                  </Botao>
                </>
              }
            />
          ))}
        </div>
      )}

      <Modal
        aberto={paraExcluir !== null}
        titulo="Confirmar exclusão"
        icone="bi-exclamation-triangle"
        aoFechar={() => setParaExcluir(null)}
        rodape={
          <>
            <Botao variante="secondary" onClick={() => setParaExcluir(null)}>
              Cancelar
            </Botao>
            <Botao variante="danger" icone="bi-trash" onClick={confirmarExclusao}>
              Excluir
            </Botao>
          </>
        }
      >
        <p className="mb-0">
          Deseja realmente excluir o plano <strong>{paraExcluir?.nome}</strong>?
        </p>
      </Modal>
    </div>
  );
}
