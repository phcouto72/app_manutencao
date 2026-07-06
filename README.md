# Sistema de Controle de Manutenção — Fase 1

Sistema web para controle de manutenção de equipamentos e estrutura predial da empresa.

## O que já está pronto nesta fase

- **Modelo de dados completo** (`prisma/schema.prisma`), já estruturado para todas as fases
  futuras do projeto: equipamentos, manutenções, estoque de peças, fornecedores, compras,
  agendamentos e auditoria.
- **Login seguro** com senha criptografada (bcrypt) e sessão via NextAuth.
- **Perfis de usuário (papéis):** ADMIN, GESTOR, TECNICO, VISUALIZADOR — controlando quem pode
  criar/editar/excluir e quem só consulta.
- **Cadastro de equipamentos:** listagem, criação, edição, exclusão, com local, categoria,
  fabricante, modelo, status operacional e nível de criticidade.
- **Log de auditoria** básico (quem criou/editou/excluiu o quê).
- **Painel inicial** com indicadores gerais.

## O que vem nas próximas fases

- Fase 2: Ordens de serviço de manutenção (equipamentos e predial) + histórico
- Fase 3: Estoque de peças + fornecedores + compras
- Fase 4: Agendamento de preventivas com aviso automático por e-mail
- Fase 5: Relatórios com exportação/impressão em PDF + dashboard com indicadores (MTBF, MTTR, custos)

## Como rodar localmente (para testar antes de subir no VPS)

Pré-requisitos: Node.js 20+, PostgreSQL instalado (local ou Docker).

```bash
npm install
cp .env.example .env    # edite com os dados do seu banco local
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Acesse `http://localhost:3000` — você será redirecionado para a tela de login.
Use o e-mail e senha que apareceram no terminal após o `prisma:seed`.

## Como colocar no ar no seu VPS (com EasyPanel)

Veja o arquivo **EASYPANEL-DEPLOY.md** — guia passo a passo específico para o seu caso,
usando Docker através do EasyPanel, sem interferir no site que já está rodando no VPS.

(O arquivo `DEPLOY.md` existe apenas como referência para um VPS sem nenhum painel instalado.)

## Estrutura de pastas

```
src/app/login              → tela de login
src/app/(app)/dashboard     → painel principal (protegido por login)
src/app/(app)/equipamentos  → cadastro de equipamentos (protegido por login)
src/app/api                 → rotas de API (autenticação e equipamentos)
src/lib                     → conexão com banco, autenticação, permissões
prisma/schema.prisma         → modelo de dados completo do sistema
```
