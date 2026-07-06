# Deploy no EasyPanel (sem afetar o site que já está no ar)

Este guia substitui o `DEPLOY.md` original, que era para instalação manual (Nginx/Certbot/PM2).
Como seu VPS já roda EasyPanel, use este caminho — ele isola o novo sistema em um container
próprio e usa o Traefik que o EasyPanel já gerencia, sem mexer no que já está funcionando.

**Não instale Nginx, Certbot ou PM2 manualmente neste VPS.** O EasyPanel já cuida de proxy
reverso e certificado SSL para cada serviço que você criar nele.

## 1. Colocar o código em um repositório Git

O EasyPanel puxa o código de um repositório (GitHub, GitLab, etc.) para construir a imagem.

1. Crie um repositório **privado** no GitHub (gratuito).
2. No seu computador, dentro da pasta `maintenance-app` (descompacte o zip que te enviei):

```bash
git init
git add .
git commit -m "Fase 1 - sistema de manutencao"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Se preferir, posso te orientar a usar GitLab ou outro Git — o processo é equivalente.

## 2. Criar o banco de dados PostgreSQL no EasyPanel

1. No painel do EasyPanel, dentro do seu **Project**, clique em **+ Service** → **Database** → **PostgreSQL**.
2. Dê um nome, por exemplo `manutencao-db`.
3. Após criado, o EasyPanel mostra os dados de conexão (host interno, usuário, senha, porta,
   nome do banco). Anote — vamos usar no próximo passo. O host interno costuma ser algo como
   `manutencao-db` (o próprio nome do serviço), já que os serviços conversam entre si pela rede
   interna do EasyPanel.

## 3. Criar o serviço da aplicação

1. Ainda no mesmo Project, clique em **+ Service** → **App**.
2. Em **Source**, escolha **GitHub** (autorize o EasyPanel a acessar o repositório) e selecione
   o repositório que você criou no passo 1.
3. Em **Build**, o EasyPanel deve detectar automaticamente o `Dockerfile` na raiz do projeto.
   Confirme que o método de build é "Dockerfile".
4. Em **Environment Variables**, adicione:

```
DATABASE_URL=postgresql://USUARIO:SENHA@manutencao-db:5432/NOME_DO_BANCO
NEXTAUTH_SECRET=(gere uma em https://generate-secret.vercel.app/32 ou rode: openssl rand -base64 32)
NEXTAUTH_URL=https://manutencao.seudominio.com.br
```

   Ajuste `USUARIO`, `SENHA`, `manutencao-db` e `NOME_DO_BANCO` conforme os dados do serviço
   de banco criado no passo 2.

5. Em **Domains**, adicione um **subdomínio** dedicado para não conflitar com o site atual, por
   exemplo: `manutencao.seudominio.com.br`. O EasyPanel emite o certificado SSL automaticamente
   para esse subdomínio.

   > Antes disso, crie um registro DNS tipo **A** (ou CNAME) para `manutencao` apontando para o
   > IP do seu VPS, no painel de DNS do seu domínio (pode ser na própria Hostinger).

6. Clique em **Deploy**. O EasyPanel vai construir a imagem Docker e subir o container.

## 4. Criar o primeiro usuário administrador

Após o primeiro deploy, abra o **terminal do container da aplicação** pelo próprio EasyPanel
(ele oferece um botão de "Console"/"Terminal" no serviço) e rode:

```bash
npm run prisma:seed
```

Isso vai imprimir no terminal o e-mail e senha do administrador inicial. Se quiser definir
você mesmo o e-mail e senha, rode antes:

```bash
SEED_ADMIN_EMAIL="voce@empresa.com.br" SEED_ADMIN_SENHA="umaSenhaForte123!" npm run prisma:seed
```

## 5. Testar

Acesse `https://manutencao.seudominio.com.br` — deve aparecer a tela de login.

## Atualizações futuras (novas fases do projeto)

Basta dar `git push` no repositório com o código atualizado e clicar em **Deploy** novamente
no serviço, dentro do EasyPanel (ou ativar o deploy automático por push, se preferir, na aba
de configurações do serviço).

## Backup do banco de dados

O EasyPanel geralmente permite configurar backups automáticos do serviço de banco de dados
direto na interface (aba do serviço PostgreSQL). Vale ativar isso assim que o banco for criado.

## Configurando o envio de e-mails (Fase 4)

Adicione estas variáveis de ambiente no serviço da aplicação, no EasyPanel (além das que já
existiam):

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=manutencao@seudominio.com.br
SMTP_PASS=a_senha_desse_email
SMTP_FROM=Manutencao <manutencao@seudominio.com.br>
CRON_SECRET=(gere um valor aleatório, ex: openssl rand -base64 24)
```

Se você tem e-mail no seu domínio pela Hostinger, os dados de SMTP costumam estar no painel de
e-mail da Hostinger (hPanel → E-mails → Configurar cliente de e-mail). Se preferir, também
funciona com outros provedores SMTP (Gmail com senha de app, SendGrid, etc.).

## Configurando o envio automático diário (Fase 4)

O sistema tem um endereço que verifica os agendamentos e manda os e-mails quando chamado:

```
https://manutencao.seudominio.com.br/api/cron/verificar-agendamentos?secret=SEU_CRON_SECRET
```

Ele **não roda sozinho** — precisa de algo que "bata" nesse endereço todo dia. Duas opções:

**Opção 1 — Serviço gratuito externo (mais simples):**
1. Crie uma conta em https://cron-job.org (gratuito)
2. Crie um novo cron job apontando para a URL acima (com o seu `CRON_SECRET` de verdade)
3. Configure para rodar 1x por dia (ex: todo dia às 8h)

**Opção 2 — Cron do próprio EasyPanel (se disponível na sua versão):**
Alguns planos/versões do EasyPanel têm um recurso de "Cron Jobs" na própria interface — se você
tiver essa opção, aponte para o mesmo endereço acima, 1x por dia.

## IMPORTANTE: volume persistente para os anexos enviados (fotos, notas fiscais, laudos)

As fotos e documentos anexados nas OS ficam salvos dentro do container, na pasta `/app/uploads`.
**Sem um volume persistente, esses arquivos somem toda vez que você faz um novo deploy**
(o container é recriado do zero a cada build).

No EasyPanel, no serviço da aplicação, procure a aba **Volumes** (ou "Mounts") e adicione:

```
Caminho no container: /app/uploads
```

O EasyPanel vai reservar um espaço em disco no próprio VPS que sobrevive aos deploys. Configure
isso antes de começar a anexar arquivos de verdade em produção.

