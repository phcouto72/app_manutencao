# Guia de Deploy — VPS Hostinger

> ⚠️ **Se o seu VPS já roda o EasyPanel, não use este guia.** Instalar Nginx/Certbot/PM2
> manualmente pode conflitar com o proxy reverso que o EasyPanel já usa (Traefik) e derrubar
> outros sites/serviços que já estão no ar nesse VPS. Use o arquivo **EASYPANEL-DEPLOY.md**
> em vez deste. Este guia aqui serve apenas para um VPS "limpo", sem nenhum painel instalado.

Este guia assume um VPS Ubuntu (22.04 ou 24.04) na Hostinger, com seu domínio já
apontado para o IP do VPS (registro tipo A no DNS).

## 1. Acessar o VPS

```bash
ssh root@SEU_IP_DO_VPS
```

## 2. Instalar o Node.js (versão 20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # deve mostrar v20.x
```

## 3. Instalar o PostgreSQL

```bash
apt-get update
apt-get install -y postgresql postgresql-contrib

# Criar o banco e o usuário do sistema
sudo -u postgres psql
```

Dentro do console do psql:
```sql
CREATE DATABASE manutencao;
CREATE USER app_manutencao WITH ENCRYPTED PASSWORD 'ESCOLHA_UMA_SENHA_FORTE';
GRANT ALL PRIVILEGES ON DATABASE manutencao TO app_manutencao;
\q
```

## 4. Instalar PM2 (mantém a aplicação rodando sempre)

```bash
npm install -g pm2
```

## 5. Enviar os arquivos do projeto para o VPS

No seu computador, dentro da pasta do projeto (que você baixou daqui):

```bash
# Exemplo usando scp — ajuste o caminho e o IP
scp -r maintenance-app root@SEU_IP_DO_VPS:/var/www/
```

Ou, se preferir, suba o projeto para um repositório Git (GitHub/GitLab) privado e depois
rode `git clone` diretamente no VPS dentro de `/var/www/`.

## 6. Configurar variáveis de ambiente

No VPS:

```bash
cd /var/www/maintenance-app
cp .env.example .env
nano .env
```

Preencha:
```
DATABASE_URL="postgresql://app_manutencao:ESCOLHA_UMA_SENHA_FORTE@localhost:5432/manutencao?schema=public"
NEXTAUTH_SECRET="(gere com: openssl rand -base64 32)"
NEXTAUTH_URL="https://seudominio.com.br"
```

## 7. Instalar dependências, gerar o banco e a build

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed      # cria o primeiro usuário administrador
npm run build
```

O comando de seed vai imprimir no terminal o e-mail e a senha inicial do administrador.
**Anote e troque essa senha assim que fizer login pela primeira vez.**

Se quiser definir o e-mail/senha do admin antes do seed:
```bash
SEED_ADMIN_EMAIL="voce@empresa.com.br" SEED_ADMIN_SENHA="umaSenhaForte123!" npm run prisma:seed
```

## 8. Iniciar a aplicação com PM2

```bash
pm2 start npm --name "manutencao" -- start
pm2 save
pm2 startup   # siga a instrução que aparecer para iniciar junto com o servidor
```

## 9. Instalar e configurar o Nginx (proxy reverso)

```bash
apt-get install -y nginx
nano /etc/nginx/sites-available/manutencao
```

Cole:
```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/manutencao /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 10. Ativar HTTPS gratuito (Let's Encrypt)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

Pronto — o sistema estará disponível em `https://seudominio.com.br`.

## Atualizações futuras (quando eu enviar novas fases do projeto)

```bash
cd /var/www/maintenance-app
git pull            # ou reenvie os arquivos atualizados
npm install
npx prisma migrate deploy
npm run build
pm2 restart manutencao
```

## Backup do banco de dados (recomendado — configurar como tarefa agendada)

```bash
pg_dump -U app_manutencao manutencao > backup_$(date +%Y%m%d).sql
```
