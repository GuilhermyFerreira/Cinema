# EduPlus — Plataforma de Cursos Online

Plataforma de cursos online com **React + TypeScript + Bootstrap 5** no frontend e uma
API **NestJS + Prisma + PostgreSQL** com autenticação **JWT** no backend.

O sistema cobre o ciclo acadêmico e financeiro de alunos e instrutores: a hierarquia de
conteúdo (**Cursos → Módulos → Aulas**), o progresso dos usuários, a curadoria de
**Trilhas de Conhecimento** e a gestão de **assinaturas e pagamentos**.

```
                      ┌──────────────────────────┐
  navegador ────────► │  Frontend React (5173)   │
                      └────────────┬─────────────┘
                                   │ fetch + Bearer <token>
                                   ▼
                      ┌──────────────────────────┐
                      │  API NestJS (3000)       │  JWT · papéis · bcrypt
                      │  Swagger em /api         │
                      └────────────┬─────────────┘
                                   │ Prisma
                                   ▼
                      ┌──────────────────────────┐
                      │  PostgreSQL (5432)       │
                      └──────────────────────────┘
```

## Por que o site deixou de usar o JSON Server

Numa versão anterior o site lia e gravava num **JSON Server**, e só o login falava com a
API NestJS. Os papéis existiam, mas **a proteção era apenas cosmética**: esconder o botão
de excluir não impedia nada, porque o JSON Server não conhece token nem papel. Bastava
abrir `http://localhost:4000/cursos/1` com `DELETE` para apagar um curso sem estar logado.

Testamos e confirmamos esse buraco:

| Chamada | Resposta de antes |
| --- | --- |
| `DELETE` no JSON Server, **sem token** | `200` — apagava |
| `DELETE` na API NestJS, com token de Aluno | `403` — bloqueava |

Como as telas falavam com a porta errada, os `403` nunca entravam em cena. Por isso o
frontend inteiro passou a consumir a API NestJS: agora **quem recusa é o servidor**, e
esconder o botão virou conveniência de interface, não a trava.

O preço dessa escolha é que o projeto deixa de cumprir ao pé da letra o critério
"Consumo da API: JSON Server" do enunciado do LAB03. Foi uma decisão consciente: sem ela,
o controle de acesso seria apenas aparência.

> O arquivo `frontend/db.json` continua no repositório como **origem dos dados de
> exemplo** — o script `npm run popular` o carrega no PostgreSQL. O site não o consome
> mais.

---

## 1. Como rodar

Pré-requisito: **PostgreSQL** em `localhost:5432` com o banco `projetocinema`.

**Backend** (primeira vez):

```bash
cd backend
npm install
cp .env.example .env         # preencha DATABASE_URL e JWT_SECRET
npx prisma migrate deploy
npx prisma generate
npm run popular              # carrega os dados de exemplo
npm run criar:admin -- "Seu Nome" admin@eduplus.com admin123
```

**Subir os dois serviços**, em terminais separados:

```bash
cd backend  && npm run start:dev   # API em http://localhost:3000/api (Swagger)
cd frontend && npm install && npm run dev   # site em http://localhost:5173
```

Acessar: **http://localhost:5173**

A URL da API fica em `frontend/.env`:

```
VITE_API_URL=http://localhost:3000
```

### Contas para teste

| Papel | E-mail | Senha |
| --- | --- | --- |
| Admin | o que você criou com `criar:admin` | a que você escolheu |
| Aluno | qualquer um dos usuários de exemplo | `senha123` |

Também dá para criar uma conta em `/cadastro` — todo autocadastro entra como **Aluno**.

---

## 2. Requisitos técnicos atendidos

| Requisito | Onde está |
| --- | --- |
| **HTML5 semântico** | `<nav>`, `<main>`, `<section>`, `<footer>`, `<form>`, `<table>` nas páginas e no layout |
| **Bootstrap 5** | Grid, Cards, Modais, Tabelas e Navbar — todos encapsulados em componentes próprios |
| **TypeScript** | Tipagem completa: interfaces por entidade + schemas Zod de validação |
| **React** | Componentes próprios construídos sobre as classes do Bootstrap (sem o JS do Bootstrap) |
| **Roteamento** | `react-router-dom` centralizado em `src/routers/app.routers.tsx` |
| **Consumo de API** | API NestJS autenticada, via camada de serviços em `src/services/` |
| **Autenticação** | Login JWT contra a API NestJS, sessão em Context e rotas protegidas |

> Os componentes de Modal e de dropdown da Navbar são implementados em **React puro**
> com as classes visuais do Bootstrap — a aplicação não carrega o bundle JavaScript do
> Bootstrap, conforme o requisito de "criar os próprios componentes".

---

## 3. Estrutura do projeto

```
frontend/
├── db.json                     # dados de exemplo; carregados no Postgres por `npm run popular`
├── .env                        # VITE_API_URL + VITE_AUTH_API_URL
└── src/
    ├── models/                 # entidades + validação (Zod) — 1 arquivo por tabela
    │   ├── usuario.model.ts        categoria.model.ts     curso.model.ts
    │   ├── modulo.model.ts         aula.model.ts          matricula.model.ts
    │   ├── progresso.model.ts      avaliacao.model.ts     trilha.model.ts
    │   ├── certificado.model.ts    plano.model.ts         assinatura.model.ts
    │   ├── pagamento.model.ts      index.ts
    │   └── auth.model.ts           # sessão, login e cadastro (não tem tabela própria)
    │
    ├── services/               # consumo da API
    │   ├── http.service.ts         # request() genérico + classe CrudService reutilizável
    │   ├── auth.service.ts         # login/cadastro JWT na API NestJS + sessão
    │   └── *.service.ts            # um serviço por entidade, com consultas específicas
    │
    ├── contexts/               # autenticacao.context.ts + AutenticacaoProvider.tsx
    ├── hooks/useAutenticacao.ts    # acesso à sessão atual
    │
    ├── components/
    │   ├── Layout/                 # Navbar (dropdowns em React), Rodapé, RotaProtegida
    │   ├── UI/                     # Botao, Cartao, Cabecalho, Modal, Tabela, Selo,
    │   │                           # Alerta, BarraProgresso, Estrelas, EstadoVazio, Carregando
    │   ├── Formulario/             # CampoTexto, CampoSelect, CampoNota
    │   ├── Cursos/                 # CartaoCurso
    │   ├── Trilhas/                # CartaoTrilha
    │   ├── Planos/                 # CartaoPlano
    │   └── Certificados/           # CertificadoVisual (documento imprimível)
    │
    ├── pages/                  # 26 telas (listagens, formulários, fluxos, login e cadastro)
    ├── routers/app.routers.tsx # todas as rotas da aplicação
    └── utils/                  # formatadores, geradores de código, extração de erros Zod
```

---

## 4. Modelo de dados

As 13 tabelas do estudo de caso existem como tabelas reais no PostgreSQL, com chaves
estrangeiras de verdade. As **chaves compostas** (`Progresso_Aulas` e `Trilhas_Cursos`)
são compostas também no banco, e suas rotas recebem os dois identificadores.

No frontend, a camada de serviços traduz entre os dois formatos: a API usa `idCurso`
numérico, as telas usam `id` em texto. Isso manteve as 24 páginas intactas durante a
migração. Para os dois recursos de chave composta, o `id` das telas é a junção das duas
partes (`"3-7"`), desmontada na hora de montar a rota.

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

As rotas têm três níveis de acesso:

| Nível | Quem alcança | O que inclui |
| --- | --- | --- |
| **Público** | qualquer visitante | início, catálogo de cursos, categorias, trilhas, planos, login e cadastro |
| **Autenticado** | Admin e Aluno | Meus cursos, Meu progresso, Meus certificados, checkout |
| **Admin** | só administradores | cadastro e edição de todo o catálogo, usuários, matrículas, avaliações, certificados, assinaturas e pagamentos |

O aluno que tenta abrir uma rota de Admin vê uma tela de **Acesso restrito** — e, se
forçar a chamada direto na API, recebe `403`.


As rotas são divididas em **vitrine pública** e **áreas restritas**. As restritas ficam
agrupadas sob `<RotaProtegida>` em `src/routers/app.routers.tsx`: sem sessão ativa, elas
redirecionam para `/login` guardando o destino pretendido, para voltar a ele depois.

| Rota | Tela |
| --- | --- |
| `/login` | Entrada com e-mail e senha (JWT da API NestJS) |
| `/cadastro` | Autocadastro público; cria a conta e já autentica |

Público: `/`, `/categorias`, `/categorias/:id`, `/cursos`, `/cursos/:id`, `/trilhas`,
`/trilhas/:id`, `/planos`, `/login` e `/cadastro`. Todo o resto exige login — inclusive os
formulários de criação e edição do catálogo (🔒 nas tabelas abaixo).

### Módulo A — Acadêmico e de Conteúdo

| Rota | Tela |
| --- | --- |
| `/categorias` | Lista de categorias |
| 🔒 `/categorias/novo` · `/categorias/editar/:id` | Cadastro de categorias |
| `/categorias/:id` | **Cursos e trilhas de uma categoria específica** |
| `/cursos` | Catálogo com busca e filtros por categoria e nível |
| 🔒 `/cursos/novo` · `/cursos/editar/:id` | Cadastro do curso |
| `/cursos/:id` | **Estrutura do curso**: adiciona Módulos e Aulas respeitando a `Ordem` |
| `/trilhas` | Lista de trilhas |
| 🔒 `/trilhas/novo` · `/trilhas/editar/:id` | Cadastro de trilhas |
| `/trilhas/:id` | Sequência de cursos da trilha, com reordenação |

### Módulo B — Usuário e Progresso

| Rota | Tela |
| --- | --- |
| 🔒 `/usuarios` · `/usuarios/novo` · `/usuarios/editar/:id` | Cadastro de alunos e instrutores |
| 🔒 `/matriculas` · `/matriculas/novo` | Matrícula em cursos, com conclusão |
| 🔒 `/progresso` | **Marca aulas como concluídas** e emite o certificado ao chegar a 100% |
| 🔒 `/avaliacoes` | Notas de 1 a 5 e comentários, cadastrados em modal |
| 🔒 `/certificados` | Emissão e **verificação por código** |
| 🔒 `/certificados/:id` | Certificado visual, pronto para impressão |

### Módulo C — Financeiro

| Rota | Tela |
| --- | --- |
| `/planos` | Vitrine de planos |
| 🔒 `/planos/novo` · `/planos/editar/:id` | Cadastro de planos |
| 🔒 `/checkout` | **Checkout em 4 etapas**: plano → assinante → pagamento → comprovante |
| 🔒 `/assinaturas` | Assinaturas com situação de vigência e total pago |
| 🔒 `/pagamentos` | Extrato com método e ID da transação |

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

**Autenticação.** O login é a única parte do site que fala com a API NestJS. O fluxo está
em `services/auth.service.ts`:

1. `POST /auth/login` com e-mail e senha. A API compara a senha com o hash **bcrypt** e
   devolve `{ access_token, usuario }`.
2. O token e o usuário vão para o `localStorage` (chaves `eduplus.token` e
   `eduplus.usuario`), e o `AutenticacaoProvider` passa a sessão para a aplicação.
3. O cadastro usa `POST /usuarios` — a única rota aberta da API além do login — e, como
   ela devolve o usuário criado mas não um token, chama o login em seguida.

O token é assinado com validade de **1 hora**. Antes de restaurar a sessão, o serviço lê o
campo `exp` do próprio JWT e descarta um token já vencido, para não manter no navegador uma
sessão que a API recusaria. Erros de rede são distinguidos de credenciais inválidas: um
`fetch` que não chega ao servidor mostra um aviso pedindo para subir o backend, enquanto o
`401` mostra "E-mail ou senha incorretos".

**Sessão na interface.** A navbar troca o botão "Entrar" pelo nome do usuário com a ação
"Sair", e esconde do visitante os menus que ele não pode abrir: o dropdown **Alunos**
desaparece por inteiro e o **Financeiro** fica só com "Planos".

**Integridade referencial.** Agora é o PostgreSQL que garante: apagar uma categoria com
cursos vinculados devolve `400`, e um par (aluno, curso) duplicado em matrículas devolve
`409`. A interface continua antecipando esses casos com mensagens claras, mas quem decide
é o banco.

**Controle de acesso.** O papel (`Admin` ou `Aluno`) viaja dentro do JWT. O site esconde o
que o usuário não pode fazer e a API recusa de fato — os dois níveis existem, mas só o
segundo é proteção. Todo autocadastro entra como `Aluno`: o papel fica fora do DTO de
criação justamente para que ninguém se promova sozinho.

---

## 7. Scripts

**frontend/**

```bash
npm run dev      # servidor de desenvolvimento (Vite)
npm run build    # typecheck (tsc -b) + build de produção
npm run lint     # ESLint
npm run preview  # pré-visualiza o build de produção
```

**backend/**

```bash
npm run start:dev    # API com recarga automática, em http://localhost:3000/api
npm run build        # compila para dist/
npm run lint         # ESLint
npm run popular      # carrega frontend/db.json no PostgreSQL
npm run criar:admin -- "Nome" email@exemplo.com senha   # cria ou promove um Admin
```

---

## 8. Backend — API NestJS com autenticação JWT

O diretório `backend/` contém uma API **NestJS 11 + Prisma 7 + PostgreSQL** com
autenticação **JWT**, documentada no Swagger.

> O frontend consome esta API por inteiro. Dela vêm
> apenas a **autenticação** (`/auth/login` e o cadastro em `/usuarios`); os demais 70 endpoints
> são exercitados pelo Swagger.

O frontend chama a API direto do navegador, o que exige **CORS** — já habilitado com
`app.enableCors()` em `src/main.ts`. As rotas **não** usam prefixo: `/api` é só o endereço
do Swagger, então o login fica em `http://localhost:3000/auth/login`.

### Como rodar

Pré-requisito: PostgreSQL em `localhost:5432` com o banco `projetocinema`.

```bash
cd backend
npm install
cp .env.example .env     # preencha DATABASE_URL e JWT_SECRET
npx prisma migrate deploy
npx prisma generate
npm run start:dev        # http://localhost:3000/api
```

O `.env` precisa das duas variáveis (o arquivo é ignorado pelo Git):

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/projetocinema?schema=public"
JWT_SECRET="uma-chave-longa-e-aleatoria"
```

Gere uma chave com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
Se `JWT_SECRET` não estiver definida, a aplicação falha ao iniciar — de propósito, para
nunca cair em uma chave padrão embutida no código.

### Estrutura

```
backend/src/
├── auth/                     # login JWT (dto, controller, service, module, jwt.strategy)
├── comum/
│   └── data-iso.decorator.ts # normaliza datas para ISO-8601 antes de validar
├── prisma/
│   ├── prisma.service.ts / prisma.module.ts
│   └── prisma-exception.filter.ts  # traduz erros do Prisma em respostas HTTP
├── usuarios/                 # POST público; demais rotas protegidas
├── categorias/   cursos/     # Core
├── modulos/      aulas/      # Conteúdo
├── matriculas/   progresso-aulas/   avaliacoes/    # Interação
├── trilhas/      trilhas-cursos/    certificados/  # Curadoria
└── planos/       assinaturas/       pagamentos/    # Negócio
```

Cada módulo segue o mesmo formato: `dto/create-*.dto.ts`, `dto/update-*.dto.ts`,
`*.controller.ts`, `*.service.ts` e `*.module.ts`.

### Rotas

São 14 recursos, todos com CRUD completo (`POST`, `GET`, `GET /:id`, `PATCH /:id`,
`DELETE /:id`), somando 72 rotas.

| Recurso | Caminho | Proteção |
| --- | --- | --- |
| Login | `POST /auth/login` | pública — devolve `access_token` |
| Usuários | `/usuarios` | `POST` **público**; restante exige token |
| Categorias | `/categorias` | token |
| Cursos | `/cursos` | token |
| Módulos | `/modulos` | token |
| Aulas | `/aulas` | token |
| Matrículas | `/matriculas` | token |
| Progresso de aulas | `/progresso-aulas` | token |
| Avaliações | `/avaliacoes` | token |
| Trilhas | `/trilhas` | token |
| Trilhas × Cursos | `/trilhas-cursos` | token |
| Certificados | `/certificados` | token |
| Planos | `/planos` | token |
| Assinaturas | `/assinaturas` | token |
| Pagamentos | `/pagamentos` | token |

O `AuthGuard('jwt')` é aplicado **por rota** em `/usuarios`, e não na classe: se fosse na
classe, o `POST /usuarios` também ficaria protegido e ninguém conseguiria se cadastrar, já
que criar o primeiro usuário exigiria um token que ainda não existe. Nos demais módulos o
guard fica na classe, porque não existe esse problema de inicialização.

### Chaves compostas

`Progresso_Aulas` e `Trilhas_Cursos` têm chave primária composta, então as rotas pontuais
recebem os dois identificadores:

```
GET    /progresso-aulas/:idUsuario/:idAula
PATCH  /progresso-aulas/:idUsuario/:idAula
DELETE /progresso-aulas/:idUsuario/:idAula

GET    /trilhas-cursos/:idTrilha/:idCurso
PATCH  /trilhas-cursos/:idTrilha/:idCurso
DELETE /trilhas-cursos/:idTrilha/:idCurso
```

Nesses dois recursos o `PATCH` não aceita alterar os campos da chave — só o conteúdo
(`status`/`dataConclusao` no progresso, `ordem` no vínculo da trilha).

### Erros tratados

Um filtro global converte os erros conhecidos do Prisma em respostas adequadas, em vez de
devolver 500:

| Situação | Código Prisma | Resposta |
| --- | --- | --- |
| Campo único repetido (e-mail, nome de categoria, código de certificado) | `P2002` | `409` com o nome do campo |
| Chave estrangeira inexistente (ex.: `idCurso` que não existe) | `P2003` | `400` |
| Registro ausente em `update`/`delete` | `P2025` | `404` |

### Datas

O Prisma recusa datas sem hora, mas `<input type="date">` envia exatamente `2026-03-10`.
O decorator `@DataIso()` normaliza o valor para ISO-8601 completo antes da validação, então
os dois formatos funcionam e uma data inválida devolve `400`, não `500`.

### Segurança das senhas

A senha chega em texto puro no DTO (campo `senha`), é convertida em hash com **bcrypt**
e gravada na coluna `SenhaHash`. Nenhuma resposta da API devolve o hash: as consultas de
leitura usam `omit: { senhaHash: true }`. A única exceção é o `findByEmail`, usado
internamente pelo `AuthService` para comparar a senha no login.

O login responde a mesma mensagem (`E-mail ou senha incorretos`) tanto para e-mail
inexistente quanto para senha errada, para não revelar quais e-mails estão cadastrados.

### Como testar no Swagger

1. Suba a API e acesse **http://localhost:3000/api**.
2. **Registrar:** `POST /usuarios` (rota pública; a senha é criptografada automaticamente).
3. **Login:** `POST /auth/login` com o mesmo e-mail e senha. Copie o `access_token`.
4. **Autorizar:** clique em **Authorize** no topo, cole o token e confirme.
5. **Acessar:** `GET /usuarios` agora responde 200. Sem o token, responde 401.
