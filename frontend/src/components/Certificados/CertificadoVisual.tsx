import type { ICertificado } from '../../models';
import { formatarData } from '../../utils/formatadores';

interface Props {
  certificado: ICertificado;
  nomeAluno: string;
  tituloCurso: string;
  tituloTrilha?: string | null;
  cargaHoraria?: number;
}

/**
 * Representação visual do certificado, com o código de verificação exigido
 * pelo modelo de dados. Estilizado para impressão em uma folha A4 paisagem.
 */
export function CertificadoVisual({
  certificado,
  nomeAluno,
  tituloCurso,
  tituloTrilha,
  cargaHoraria,
}: Props) {
  return (
    <div className="certificado card border-3 border-primary shadow-lg">
      <div className="card-body text-center p-4 p-md-5">
        <p className="text-uppercase text-body-secondary letra-espacada mb-1 small">
          <i className="bi bi-mortarboard-fill me-2 text-primary"></i>
          EduPlus · Plataforma de Cursos Online
        </p>

        <h2 className="fw-bold text-primary mb-4">Certificado de Conclusão</h2>

        <p className="text-body-secondary mb-1">Certificamos que</p>
        <p className="display-6 fw-bold mb-3">{nomeAluno}</p>

        <p className="text-body-secondary mb-1">concluiu com êxito o curso</p>
        <p className="fs-4 fw-semibold mb-3">{tituloCurso}</p>

        {cargaHoraria != null && (
          <p className="text-body-secondary">
            com carga horária de <strong>{cargaHoraria} horas</strong>
          </p>
        )}

        {tituloTrilha && (
          <p className="text-body-secondary">
            integrante da trilha <strong>{tituloTrilha}</strong>
          </p>
        )}

        <hr className="my-4" />

        <div className="row g-3 text-start small">
          <div className="col-sm-6">
            <span className="text-body-secondary d-block">Data de emissão</span>
            <strong>{formatarData(certificado.dataEmissao)}</strong>
          </div>
          <div className="col-sm-6 text-sm-end">
            <span className="text-body-secondary d-block">
              Código de verificação
            </span>
            <strong className="font-monospace fs-6 text-primary">
              {certificado.codigoVerificacao}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
