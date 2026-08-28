# EduPlus — Plataforma de Cursos Online

Projeto do **LAB03**: interface funcional de uma plataforma de cursos online, construída
com **React + TypeScript + Bootstrap 5**, consumindo uma API **JSON Server**.

O sistema cobre o ciclo acadêmico e financeiro de alunos e instrutores: a hierarquia de
conteúdo (**Cursos → Módulos → Aulas**), o progresso dos usuários, a curadoria de
**Trilhas de Conhecimento** e a gestão de **assinaturas e pagamentos**.

```
                      ┌──────────────────────────┐
  navegador ────────► │  Frontend React (5173)   │
                      └────────────┬─────────────┘
                                   │ fetch
                                   ▼
                      ┌──────────────────────────┐
                      │  JSON Server (4000)      │──► frontend/db.json
                      └──────────────────────────┘
```

---

## 1. Como rodar

Instalar as dependências (só na primeira vez):

```bash
cd frontend
npm install
```

Abrir **dois terminais**, os dois dentro de `frontend`:

```bash
npm run server   # terminal 1 — JSON Server em http://localhost:4000
npm run dev      # terminal 2 — site em http://localhost:5173
```

Acessar: **http://localhost:5173**

A URL da API fica em `frontend/.env` (`VITE_API_URL=http://localhost:4000`).

---

## 2. Requisitos técnicos atendidos

| Requisito | Onde está |
| --- | --- |
| **HTML5 semântico** | `<nav>`, `<main>`, `<section>`, `<footer>`, `<form>`, `<table>` nas páginas e no layout |
| **Bootstrap 5** | Grid, Cards, Modais, Tabelas e Navbar — todos encapsulados em componentes próprios |
| **TypeScript** | Tipagem completa: interfaces por entidade + schemas Zod de validação |
| **React** | Componentes próprios construídos sobre as classes do Bootstrap (sem o JS do Bootstrap) |
| **Roteamento** | `react-router-dom` centralizado em `src/routers/app.routers.tsx` |
| **Consumo de API** | JSON Server, via camada de serviços em `src/services/` |

> Os componentes de Modal e de dropdown da Navbar são implementados em **React puro**
> com as classes visuais do Bootstrap — a aplicação não carrega o bundle JavaScript do
> Bootstrap, conforme o requisito de "criar os próprios componentes".

---

## 3. Estrutura do projeto

```
frontend/
├── db.json                     # base do JSON Server (14 coleções, com dados de exemplo)
├── .env                        # VITE_API_URL
└── src/
    ├── models/                 # entidades + validação (Zod) — 1 arquivo por tabela
    │   ├── usuario.model.ts        categoria.model.ts     curso.model.ts
    │   ├── modulo.model.ts         aula.model.ts          matricula.model.ts
    │   ├── progresso.model.ts      avaliacao.model.ts     trilha.model.ts
    │   ├── certificado.model.ts    plano.model.ts         assinatura.model.ts
    │   └── pagamento.model.ts      index.ts
    │
    ├── services/               # consumo da API
    │   ├── http.service.ts         # request() genérico + classe CrudService reutilizável
    │   └── *.service.ts            # um serviço por entidade, com consultas específicas
    │
    ├── components/
    │   ├── Layout/                 # Navbar (com dropdowns em React), Rodapé
    │   ├── UI/                     # Botao, Cartao, Cabecalho, Modal, Tabela, Selo,
    │   │                           # Alerta, BarraProgresso, Estrelas, EstadoVazio, Carregando
    │   ├── Formulario/             # CampoTexto, CampoSelect, CampoNota
    │   ├── Cursos/                 # CartaoCurso
    │   ├── Trilhas/                # CartaoTrilha
    │   ├── Planos/                 # CartaoPlano
    │   └── Certificados/           # CertificadoVisual (documento imprimível)
    │
    ├── pages/                  # 24 telas (listagens, formulários e fluxos)
    ├── routers/app.routers.tsx # todas as rotas da aplicação
    └── utils/                  # formatadores, geradores de código, extração de erros Zod
```

---

## 4. Modelo de dados

As 13 tabelas do estudo de caso viraram coleções do JSON Server. Como o JSON Server exige
uma chave `id` simples, as **chaves compostas** (`Progresso_Aulas` e `Trilhas_Cursos`) são
representadas por um `id` próprio, com a unicidade do par garantida na camada de serviço.

| Grupo | Coleções |
| --- | --- |
| **Core** | `usuarios`, `categorias`, `cursos` |
| **Conteúdo** | `modulos`, `aulas` |
| **Interação** | `matriculas`, `progressoAulas`, `avaliacoes` |
| **Curadoria** | `trilhas`, `trilhasCursos`, `certificados` |
| **Negócio** | `planos`, `assinaturas`, `pagamentos` |

O campo `perfil` (`Aluno` / `Instrutor`) foi acrescentado a `usuarios` para permitir que a
interface separe quem ministra cursos de quem se matricula neles.

---

## 5. Telas e rotas

### Módulo A — Acadêmico e de Conteúdo

| Rota | Tela |
| --- | --- |
| `/categorias` · `/categorias/novo` · `/categorias/editar/:id` | CRUD de categorias |
| `/categorias/:id` | **Cursos e trilhas de uma categoria específica** |
| `/cursos` | Catálogo com busca e filtros por categoria e nível |
| `/cursos/novo` · `/cursos/editar/:id` | Cadastro do curso |
| `/cursos/:id` | **Estrutura do curso**: adiciona Módulos e Aulas respeitando a `Ordem` |
| `/trilhas` · `/trilhas/novo` · `/trilhas/editar/:id` | CRUD de trilhas |
| `/trilhas/:id` | Sequência de cursos da trilha, com reordenação |

### Módulo B — Usuário e Progresso

| Rota | Tela |
| --- | --- |
| `/usuarios` · `/usuarios/novo` · `/usuarios/editar/:id` | Cadastro de alunos e instrutores |
| `/matriculas` · `/matriculas/novo` | Matrícula em cursos, com conclusão |
| `/progresso` | **Marca aulas como concluídas** e emite o certificado ao chegar a 100% |
| `/avaliacoes` | Notas de 1 a 5 e comentários, cadastrados em modal |
| `/certificados` | Emissão e **verificação por código** |
| `/certificados/:id` | Certificado visual, pronto para impressão |

### Módulo C — Financeiro

| Rota | Tela |
| --- | --- |
| `/planos` · `/planos/novo` · `/planos/editar/:id` | CRUD de planos |
| `/checkout` | **Checkout em 4 etapas**: plano → assinante → pagamento → comprovante |
| `/assinaturas` | Assinaturas com situação de vigência e total pago |
| `/pagamentos` | Extrato com método e ID da transação |

---

## 6. Detalhes de implementação

**Camada de serviços.** `CrudService<T>` concentra `listar`, `obter`, `criar`, `atualizar` e
`excluir` para qualquer coleção. Cada entidade estende essa classe e acrescenta o que é
específico dela — por exemplo, `cursoService.listarPorCategoria()`,
`certificadoService.verificar(codigo)` e `moduloService.proximaOrdem(idCurso)`.

**Validação.** Cada model exporta um schema Zod. Os formulários chamam `schema.parse()` e
convertem o `ZodError` em um mapa `campo → mensagem` (`utils/validacao.ts`), exibido pelas
classes `is-invalid` / `invalid-feedback` do Bootstrap.

**Ordem do conteúdo.** Módulos e aulas são sempre listados ordenados pelo campo `Ordem`, e o
formulário já sugere a próxima posição livre. Na trilha, as setas ↑/↓ trocam a `Ordem` entre
os cursos vizinhos.

**Certificados.** O código de verificação (`CERT-XXXX-XXXX`) é gerado na emissão e é único.
A página de certificados permite consultar um código e confirmar sua validade.

**Checkout.** Ao concluir, o fluxo grava dois registros: a `Assinatura` (com `DataFim`
calculada a partir da duração do plano) e o `Pagamento`, com método escolhido e
`Id_Transacao_Gateway` gerado (`TRX-<timestamp>-<sufixo>`).

**Integridade referencial.** Como o JSON Server não tem chaves estrangeiras, as regras são
aplicadas na interface: categorias com cursos vinculados não podem ser excluídas, um aluno
não é matriculado duas vezes no mesmo curso, e excluir uma trilha remove antes seus
vínculos em `trilhasCursos`.

---

## 7. Scripts

```bash
npm run dev      # servidor de desenvolvimento (Vite)
npm run server   # API JSON Server na porta 4000
npm run build    # typecheck (tsc -b) + build de produção
npm run lint     # ESLint
npm run preview  # pré-visualiza o build de produção
```

---

## 8. Pasta `backend/`

O diretório `backend/` contém uma API **NestJS + Prisma + PostgreSQL** de um laboratório
anterior. O `prisma/schema.prisma` já foi reescrito com as 13 tabelas da plataforma de
cursos, mas os módulos NestJS (`src/filmes/`) ainda são os do domínio antigo.

> ⚠️ O backend **não** é usado pelo site: o LAB03 pede consumo de API via **JSON Server**,
> e é isso que o frontend faz. A API NestJS só voltará a compilar depois que os módulos
> forem reescritos para as entidades novas e o cliente Prisma for regerado.
