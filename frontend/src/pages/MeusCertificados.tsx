import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { certificadoService, cursoService, trilhaService } from '../services';
import type { ICertificado, ICurso, ITrilha } from '../models';
import { useAutenticacao } from '../hooks/useAutenticacao';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Alerta } from '../components/UI/Alerta';
import { formatarData } from '../utils/formatadores';

/** Certificados emitidos para o usuário da sessão. */
export function MeusCertificados() {
  const { idLocal } = useAutenticacao();

  const [certificados, setCertificados] = useState<ICertificado[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [trilhas, setTrilhas] = useState<ITrilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!idLocal) {
      setCarregando(false);
      return;
    }

    (async () => {
      try {
        const [meus, listaCursos, listaTrilhas] = await Promise.all([
          certificadoService.listarPorUsuario(idLocal),
          cursoService.listar(),
          trilhaService.listar(),
        ]);

        setCertificados(meus);
        setCursos(listaCursos);
        setTrilhas(listaTrilhas);
      } catch (falha) {
        console.error('Erro ao carregar os certificados:', falha);
        setErro('Não foi possível carregar seus certificados.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [idLocal]);

  function tituloCurso(idCurso: string): string {
    return cursos.find((c) => c.id === idCurso)?.titulo ?? 'Curso removido';
  }

  function tituloTrilha(idTrilha: string | null): string | null {
    if (!idTrilha) return null;
    return trilhas.find((t) => t.id === idTrilha)?.titulo ?? null;
  }

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Meus certificados"
        descricao="Os certificados que você conquistou ao concluir cursos."
        icone="bi-patch-check"
      />

      {erro && <Alerta tipo="danger">{erro}</Alerta>}

      {!idLocal ? (
        <Alerta tipo="warning">
          Não foi possível vincular sua conta aos dados do site. Verifique se o
          JSON Server está rodando e entre novamente.
        </Alerta>
      ) : certificados.length === 0 ? (
        <EstadoVazio
          mensagem="Você ainda não tem certificados. Conclua um curso para emitir o primeiro."
          icone="bi-patch-check"
          acao={
            <Link to="/meu-progresso" className="btn btn-primary">
              Ver meu progresso
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {certificados.map((certificado) => {
            const trilha = tituloTrilha(certificado.idTrilha);

            return (
              <div className="col" key={certificado.id}>
                <div className="card h-100 shadow-sm border-success border-2">
                  <div className="card-body d-flex flex-column">
                    <i className="bi bi-patch-check-fill display-6 text-success mb-2"></i>

                    <h5 className="card-title">
                      {tituloCurso(certificado.idCurso)}
                    </h5>

                    {trilha && (
                      <p className="small text-body-secondary mb-2">
                        <i className="bi bi-signpost-split me-2"></i>
                        Trilha: {trilha}
                      </p>
                    )}

                    <ul className="list-unstyled small text-body-secondary flex-grow-1 mb-3">
                      <li className="mb-1">
                        <i className="bi bi-calendar3 me-2"></i>
                        Emitido em {formatarData(certificado.dataEmissao)}
                      </li>
                      <li>
                        <i className="bi bi-shield-check me-2"></i>
                        Código:{' '}
                        <strong className="font-monospace text-success">
                          {certificado.codigoVerificacao}
                        </strong>
                      </li>
                    </ul>

                    <Link
                      to={`/certificados/${certificado.id}`}
                      className="btn btn-success btn-sm mt-auto"
                    >
                      <i className="bi bi-eye me-1"></i>Ver certificado
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
