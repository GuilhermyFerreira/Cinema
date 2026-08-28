import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  certificadoService,
  usuarioService,
  cursoService,
  trilhaService,
} from '../services';
import type { ICertificado } from '../models';
import { Carregando } from '../components/UI/Carregando';
import { Alerta } from '../components/UI/Alerta';
import { Botao } from '../components/UI/Botao';
import { CertificadoVisual } from '../components/Certificados/CertificadoVisual';

/** Exibição do certificado emitido, pronto para impressão. */
export function CertificadoDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [certificado, setCertificado] = useState<ICertificado | null>(null);
  const [nomeAluno, setNomeAluno] = useState('');
  const [tituloCurso, setTituloCurso] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState<number | undefined>();
  const [tituloTrilha, setTituloTrilha] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const atual = await certificadoService.obter(id);
        setCertificado(atual);

        const [aluno, curso, trilha] = await Promise.all([
          usuarioService.obter(atual.idUsuario).catch(() => null),
          cursoService.obter(atual.idCurso).catch(() => null),
          atual.idTrilha
            ? trilhaService.obter(atual.idTrilha).catch(() => null)
            : Promise.resolve(null),
        ]);

        setNomeAluno(aluno?.nomeCompleto ?? 'Aluno não identificado');
        setTituloCurso(curso?.titulo ?? 'Curso não identificado');
        setCargaHoraria(curso?.totalHoras);
        setTituloTrilha(trilha?.titulo ?? null);
      } catch (falha) {
        console.error('Erro ao carregar certificado:', falha);
        setErro('Não foi possível carregar o certificado.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  if (carregando) return <Carregando />;
  if (erro) return <Alerta tipo="danger">{erro}</Alerta>;
  if (!certificado)
    return <Alerta tipo="warning">Certificado não encontrado.</Alerta>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 d-print-none">
        <Link to="/certificados" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </Link>
        <Botao icone="bi-printer" onClick={() => window.print()}>
          Imprimir certificado
        </Botao>
      </div>

      <CertificadoVisual
        certificado={certificado}
        nomeAluno={nomeAluno}
        tituloCurso={tituloCurso}
        tituloTrilha={tituloTrilha}
        cargaHoraria={cargaHoraria}
      />
    </div>
  );
}
