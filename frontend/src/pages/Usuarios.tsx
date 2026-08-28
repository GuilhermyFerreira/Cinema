import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services';
import type { IUsuario, PerfilUsuario } from '../models';
import { PERFIS } from '../models';
import { Cabecalho } from '../components/UI/Cabecalho';
import { Carregando } from '../components/UI/Carregando';
import { EstadoVazio } from '../components/UI/EstadoVazio';
import { Tabela } from '../components/UI/Tabela';
import { Selo } from '../components/UI/Selo';
import { Modal } from '../components/UI/Modal';
import { Botao } from '../components/UI/Botao';
import { formatarData } from '../utils/formatadores';

/** Listagem de usuários (alunos e instrutores) com filtro por perfil. */
export function Usuarios() {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroPerfil, setFiltroPerfil] = useState<PerfilUsuario | 'Todos'>('Todos');
  const [busca, setBusca] = useState('');
  const [paraExcluir, setParaExcluir] = useState<IUsuario | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setCarregando(true);
    try {
      setUsuarios(await usuarioService.listar());
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir?.id) return;
    try {
      await usuarioService.excluir(paraExcluir.id);
      setParaExcluir(null);
      carregarUsuarios();
    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
    }
  }

  const filtrados = usuarios.filter((usuario) => {
    const combinaPerfil =
      filtroPerfil === 'Todos' || usuario.perfil === filtroPerfil;
    const termo = busca.trim().toLowerCase();
    const combinaBusca =
      !termo ||
      usuario.nomeCompleto.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo);
    return combinaPerfil && combinaBusca;
  });

  if (carregando) return <Carregando />;

  return (
    <div>
      <Cabecalho
        titulo="Usuários"
        descricao="Alunos e instrutores cadastrados na plataforma."
        icone="bi-people"
        textoBotao="Novo usuário"
        linkBotao="/usuarios/novo"
      />

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filtroPerfil}
            onChange={(evento) =>
              setFiltroPerfil(evento.target.value as PerfilUsuario | 'Todos')
            }
            aria-label="Filtrar por perfil"
          >
            <option value="Todos">Todos os perfis</option>
            {PERFIS.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfil}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EstadoVazio
          mensagem="Nenhum usuário encontrado."
          icone="bi-person-x"
          acao={
            <Link to="/usuarios/novo" className="btn btn-primary">
              Cadastrar o primeiro usuário
            </Link>
          }
        />
      ) : (
        <div className="card shadow-sm">
          <Tabela colunas={['Nome completo', 'E-mail', 'Perfil', 'Cadastro', 'Ações']}>
            {filtrados.map((usuario) => (
              <tr key={usuario.id}>
                <td className="fw-semibold">{usuario.nomeCompleto}</td>
                <td className="text-body-secondary">{usuario.email}</td>
                <td>
                  <Selo
                    texto={usuario.perfil}
                    cor={usuario.perfil === 'Instrutor' ? 'primary' : 'secondary'}
                    icone={
                      usuario.perfil === 'Instrutor'
                        ? 'bi-person-video3'
                        : 'bi-person'
                    }
                  />
                </td>
                <td>{formatarData(usuario.dataCadastro)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/usuarios/editar/${usuario.id}`}
                      className="btn btn-outline-secondary btn-sm"
                      aria-label={`Editar ${usuario.nomeCompleto}`}
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      aria-label={`Excluir ${usuario.nomeCompleto}`}
                      onClick={() => setParaExcluir(usuario)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Tabela>
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
          Deseja realmente excluir o usuário{' '}
          <strong>{paraExcluir?.nomeCompleto}</strong>? Matrículas e certificados
          vinculados deixarão de ter referência.
        </p>
      </Modal>
    </div>
  );
}
