/** Rodapé institucional exibido em todas as páginas. */
export function Rodape() {
  return (
    <footer className="border-top mt-5 py-4">
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="text-body-secondary small">
          <i className="bi bi-mortarboard-fill me-2 text-primary"></i>
          EduPlus — Plataforma de Cursos Online
        </span>
        <span className="text-body-secondary small">
          LAB03 · React + TypeScript + Bootstrap 5 · API JSON Server
        </span>
      </div>
    </footer>
  );
}
