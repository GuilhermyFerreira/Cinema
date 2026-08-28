import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { planoService } from '../services';
import { planoSchema } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CampoTexto } from '../components/Formulario/CampoTexto';
import { extrairErros } from '../utils/validacao';
import { formatarMoeda } from '../utils/formatadores';

/** Cadastro e edição de planos (tabela Planos). */
export function PlanoForm() {
  const navegar = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicao = Boolean(id);

  const [dados, setDados] = useState({
    nome: '',
    descricao: '',
    preco: '0',
    duracaoMeses: '1',
  });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (!modoEdicao || !id) return;

    (async () => {
      try {
        const plano = await planoService.obter(id);
        setDados({
          nome: plano.nome,
          descricao: plano.descricao,
          preco: String(plano.preco),
          duracaoMeses: String(plano.duracaoMeses),
        });
      } catch (erro) {
        console.error('Erro ao carregar plano:', erro);
        setErroGeral('Não foi possível carregar o plano para edição.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [modoEdicao, id]);

  function aoMudar(
    evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral('');
    setSalvando(true);

    try {
      const validado = planoSchema.parse(dados);

      if (modoEdicao && id) {
        await planoService.atualizar(id, validado);
      } else {
        await planoService.criar(validado);
      }
      navegar('/planos');
    } catch (erro) {
      const errosCampos = extrairErros(erro);
      if (Object.keys(errosCampos).length) {
        setErros(errosCampos);
      } else {
        console.error('Erro ao salvar plano:', erro);
        setErroGeral('Não foi possível salvar o plano. Verifique a API.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  const preco = Number(dados.preco) || 0;
  const meses = Number(dados.duracaoMeses) || 1;

  return (
    <div>
      <Cabecalho
        titulo={modoEdicao ? 'Editar plano' : 'Novo plano'}
        descricao="Oferta de assinatura disponível no checkout."
        icone="bi-box-seam"
      />

      {erroGeral && <Alerta tipo="danger">{erroGeral}</Alerta>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={aoEnviar} className="row g-3" noValidate>
            <CampoTexto
              className="col-md-6"
              label="Nome"
              name="nome"
              value={dados.nome}
              onChange={aoMudar}
              erro={erros.nome}
              placeholder="Ex.: Plano Anual"
            />

            <CampoTexto
              className="col-md-3"
              label="Preço (R$)"
              name="preco"
              type="number"
              step="0.01"
              min={0}
              value={dados.preco}
              onChange={aoMudar}
              erro={erros.preco}
            />

            <CampoTexto
              className="col-md-3"
              label="Duração (meses)"
              name="duracaoMeses"
              type="number"
              min={1}
              value={dados.duracaoMeses}
              onChange={aoMudar}
              erro={erros.duracaoMeses}
            />

            <CampoTexto
              className="col-12"
              label="Descrição"
              name="descricao"
              textarea
              rows={3}
              value={dados.descricao}
              onChange={aoMudar}
              erro={erros.descricao}
              placeholder="O que está incluído neste plano..."
            />

            <div className="col-12">
              <div className="alert alert-info mb-0">
                <i className="bi bi-calculator me-2"></i>
                Equivale a <strong>{formatarMoeda(preco / meses)}</strong> por mês.
              </div>
            </div>

            <div className="col-12 d-flex gap-2 pt-3 border-top">
              <Botao
                type="submit"
                variante="success"
                icone="bi-check-lg"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar plano'}
              </Botao>
              <Botao variante="secondary" onClick={() => navegar('/planos')}>
                Cancelar
              </Botao>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
