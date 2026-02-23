# Tudo local na sua VM

O ArchiSuite está configurado para rodar **tudo local** na sua VM: app Next.js, banco de dados (PostgreSQL) e arquivos (pasta no disco). Sem Vercel, Supabase nem S3 para produção — só sua máquina.

Este guia cobre: como **descobrir se o Postgres já está rodando** (Docker, Kubernetes ou instalado no sistema) e como **configurar app + banco + uploads** na VM.

---

## Descobrir como o banco está rodando na VM

Se você lembra que tem um banco na VM mas não sabe se é Docker, Kubernetes ou instalado direto, rode estes comandos **na VM** (na ordem).

### 1. Postgres instalado no sistema (serviço local)

```bash
systemctl status postgresql
# ou
sudo service postgresql status
```

Se aparecer **active (running)**, o Postgres está instalado e rodando localmente. A porta padrão é **5432**. Para conectar:

```bash
sudo -u postgres psql -c "\l"   # lista os bancos
```

**DATABASE_URL:** `postgresql://usuario:senha@localhost:5432/nome_do_banco`

---

### 2. Postgres em Docker

```bash
docker ps -a | grep -i postgres
# ou ver todos os containers
docker ps -a
```

Se aparecer um container com postgres (nome ou imagem `postgres`), o banco está no Docker. Anote o **nome do container** e a **porta mapeada** (ex.: `0.0.0.0:5432->5432/tcp`).

Para acessar de dentro do host (sua VM):

- Se a porta 5432 está mapeada para o host: use `localhost:5432`.
- Para ver usuário/senha e nome do banco, inspecione o container ou o `docker-compose` que sobe ele:

```bash
docker inspect NOME_DO_CONTAINER
# ou, se tiver docker-compose no mesmo diretório:
cat docker-compose.yml
```

**DATABASE_URL:** `postgresql://usuario:senha@localhost:PORTA_MAPEADA/nome_do_banco`

---

### 3. Postgres em Kubernetes

```bash
kubectl get pods -A | grep -i postgres
# ou
kubectl get svc -A | grep -i postgres
```

Se existir um Pod ou Service de Postgres, o banco está no Kubernetes. Para conectar a partir da sua VM (fora do cluster):

- **Port-forward** (para desenvolvimento/local):

```bash
kubectl port-forward -n NAMESPACE svc/NOME_DO_SERVICE 5432:5432
```

Aí use `localhost:5432` no `.env`. Ou descubra o **NodePort** / **LoadBalancer** do Service se já estiver exposto.

**DATABASE_URL:** `postgresql://usuario:senha@localhost:5432/nome_do_banco` (com port-forward) ou o host/porta do Service.

---

### Resumo rápido

| Onde está o Postgres | Como verificar | O que usar em DATABASE_URL |
|----------------------|----------------|----------------------------|
| **Sistema (systemd)** | `systemctl status postgresql` | `postgresql://...@localhost:5432/...` |
| **Docker** | `docker ps -a \| grep postgres` | `postgresql://...@localhost:PORTA/...` (porta mapeada) |
| **Kubernetes** | `kubectl get pods -A \| grep postgres` | Port-forward ou host do Service + `postgresql://...@...` |

Se **não** tiver Postgres em lugar nenhum, use a seção abaixo para instalar direto na VM (Cenário A).

---

## Cenário único — Tudo local na VM (app + banco + arquivos)

O ArchiSuite roda inteiro na sua VM: Next.js, Postgres e pasta de uploads. Você não usa Vercel para o app (só opcional para previews).

### O que ter na VM

- **Node.js** 18+ (para rodar `npm run build` e `npm run start`)
- **PostgreSQL** (banco)
- **Pasta** no disco para uploads (ex.: `/var/archisuite/uploads` ou `./uploads` no projeto)

### Se não tiver Postgres ainda: instalar na VM

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Criar usuário e banco:

```bash
sudo -u postgres psql -c "CREATE USER archisuite WITH PASSWORD 'sua_senha_segura';"
sudo -u postgres psql -c "CREATE DATABASE archisuite OWNER archisuite;"
```

**Onde configurar:** no `.env` da VM (ou do servidor):

```env
DATABASE_URL=postgresql://archisuite:sua_senha_segura@localhost:5432/archisuite
```

### 2. Pasta de uploads na VM

```bash
# Exemplo: pasta dedicada
sudo mkdir -p /var/archisuite/uploads
sudo chown "$USER" /var/archisuite/uploads
```

Ou, se preferir dentro do projeto:

```bash
mkdir -p ./uploads
```

**Onde configurar:** no `.env`:

```env
UPLOADS_DIR=/var/archisuite/uploads
# ou, relativo ao projeto:
# UPLOADS_DIR=./uploads
```

(O código do app vai usar essa variável para salvar os PDFs/plantas; quando implementar upload, leia `process.env.UPLOADS_DIR`.)

### 3. Rodar o app na VM

Na pasta do projeto na VM:

```bash
cd /caminho/para/arqhub
cp .env.example .env
# Edite .env: GEMINI_API_KEY, DATABASE_URL, UPLOADS_DIR
npm install
npm run build
npm run start
```

O Next.js sobe na porta 3000. Para expor na internet:

- Use **Nginx** (ou Caddy) como reverso proxy e **HTTPS** (ex.: Let’s Encrypt).
- Ou um túnel (ex.: Cloudflare Tunnel) apontando para `localhost:3000`.

**Resumo:** Tudo local no seu controle; você só precisa de domínio/IP, HTTPS e backup do Postgres e da pasta de uploads.

---

## Opcional — App na Vercel, banco e arquivos na VM

O front/API continua na Vercel; só o **banco** e os **arquivos** ficam na sua VM.

### Banco na VM

1. Tenha o Postgres na VM (instalado, Docker ou K8s — veja a seção “Descobrir como o banco está rodando” acima).
2. Deixe o Postgres acessível pela rede:
   - Edite `postgresql.conf`: `listen_addresses = '*'` (ou o IP da VM).
   - Edite `pg_hba.conf`: libere conexões do IP da Vercel (ou de um range que você use). Ex.:  
     `host archisuite archisuite 0.0.0.0/0 scram-sha-256`
   - Reinicie o Postgres e abra a porta **5432** no firewall (só se for seguro; ideal restringir ao IP da Vercel).
3. Na Vercel, em **Environment Variables**, configure:
   - `DATABASE_URL=postgresql://archisuite:SENHA@IP_PUBLICO_DA_VM:5432/archisuite`

**Segurança:** Preferir VPN ou túnel (ex.: Tailscale, Cloudflare Tunnel) em vez de expor a porta 5432 direto na internet. Se expor, use senha forte e, se possível, restrição por IP.

### Arquivos na VM

O código da Vercel **não acessa o disco da sua VM**. Para usar a VM como storage, você precisa de um **serviço na VM** que receba os uploads (ex.: API que aceita `multipart/form-data` e grava em `UPLOADS_DIR`). O app na Vercel chama essa API (ex.: `https://sua-vm.com/api/upload`) e guarda a URL do arquivo no banco.

Resumo:

- Na VM: API de upload (Node/Express ou outro) que grava em `UPLOADS_DIR` e devolve URL ou caminho.
- No ArchiSuite (Vercel): ao fazer upload, enviar o arquivo para essa API e salvar o retorno no Postgres.

Detalhar essa API fica para quando implementar a Fase 1 (upload). O importante: **arquivos na VM = um serviço na VM que recebe e salva os arquivos**.

---

## Variáveis no .env (tudo local)

| Variável        | Tudo local (padrão) |
|-----------------|----------------------|
| `DATABASE_URL`  | `postgresql://...@localhost:5432/archisuite` (ou porta do Docker/K8s) |
| `UPLOADS_DIR`   | `/var/archisuite/uploads` ou `./uploads` |
| `GEMINI_API_KEY`| No `.env` da VM (obrigatório para o briefing com IA) |

---

## Backup (recomendado)

- **Postgres:** `pg_dump` periódico (cron) para um arquivo e copiar para outro servidor ou storage.
- **Uploads:** copiar a pasta `UPLOADS_DIR` (rsync, script, ou backup na nuvem) com frequência.

Se quiser, no próximo passo podemos desenhar a API de upload na VM ou a estrutura de pastas por projeto dentro de `UPLOADS_DIR`.
