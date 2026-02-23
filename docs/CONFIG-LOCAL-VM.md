# Configuração local na VM — ArchiSuite

Sua VM já tem **PostgreSQL 16** rodando (porta 5432). Falta criar o usuário e o banco e preencher o `.env`.

---

## 1. Criar usuário e banco no Postgres

Rode **na VM** (vai pedir sua senha de sudo):

```bash
# Troque "SuaSenhaSegura123" por uma senha que você for usar no DATABASE_URL
sudo -u postgres psql -c "CREATE USER archisuite WITH PASSWORD 'SuaSenhaSegura123';"
sudo -u postgres psql -c "CREATE DATABASE archisuite OWNER archisuite;"
```

Se der erro **"already exists"**, o usuário ou o banco já existem; use a mesma senha que você definiu antes (ou altere a senha com):

```bash
sudo -u postgres psql -c "ALTER USER archisuite WITH PASSWORD 'SuaSenhaSegura123';"
```

---

## 2. Ajustar o `.env`

Na raiz do projeto (`git/arqhub`), edite o arquivo **`.env`**:

1. **DATABASE_URL** — troque `SUA_SENHA` pela mesma senha que você usou no comando acima:
   ```
   DATABASE_URL=postgresql://archisuite:SuaSenhaSegura123@localhost:5432/archisuite
   ```

2. **GEMINI_API_KEY** — cole sua chave do Google AI Studio (a que está no nível gratuito).

Salve o arquivo.

---

## 3. Testar a conexão com o banco

```bash
cd /home/admin/arsenal/git/arqhub
psql "$DATABASE_URL" -c "SELECT 1 as ok;"
```

(Se `psql` não aceitar a URL, use:  
`psql -h localhost -U archisuite -d archisuite -c "SELECT 1 as ok;"`  
e digite a senha quando pedir.)

Se retornar `ok | 1`, a conexão está ok.

---

## 4. Rodar o app

```bash
cd /home/admin/arsenal/git/arqhub
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). A API de briefing está em `POST http://localhost:3000/api/briefing` (body: `{"text": "..."}`).

---

## Resumo do que já está na VM

| Item | Status |
|------|--------|
| PostgreSQL 16 | Rodando na porta 5432 |
| Usuário `archisuite` | Criar com os comandos acima |
| Banco `archisuite` | Criar com os comandos acima |
| Pasta `./uploads` | Já criada no projeto |
| Arquivo `.env` | Criado; falta preencher senha do banco e GEMINI_API_KEY |
