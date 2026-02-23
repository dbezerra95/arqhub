# ArchiSuite — Onde criar conta e onde configurar

Passo a passo: em que site criar conta, o que fazer em cada um e onde colocar as configurações no projeto.

---

## 1. Google Gemini (IA do briefing)

### Onde ir

- **Site:** [Google AI Studio — API Key](https://aistudio.google.com/app/apikey)  
- Abre a tela de chaves do Google AI. Se pedir, você aceita os termos e usa uma conta Google (Gmail).

### O que fazer

1. Acesse o link acima e faça login com sua conta Google.
2. Clique em **“Create API key”** (ou “Criar chave de API”).
3. Se aparecer “Create API key in new project”, escolha isso (ou use um projeto Google Cloud existente).
4. A chave será exibida **uma vez**. Copie e guarde em um lugar seguro (ex.: gerenciador de senhas).

### Onde configurar no ArchiSuite

- **Arquivo:** na raiz do projeto, crie ou edite o arquivo **`.env`** (ele não vai pro Git).
- **Variável:**  
  `GEMINI_API_KEY=cole_sua_chave_aqui`
- **Como criar o .env:**  
  Na pasta do projeto: `cp .env.example .env` e depois abra `.env` e preencha o valor de `GEMINI_API_KEY`.

**Testar:** Depois de rodar `npm run dev`, chamar `POST /api/briefing` com um JSON `{ "text": "..." }`. Se devolver resumo, está certo.

---

## 2. Vercel (hospedar o app na nuvem)

### Onde ir

- **Site:** [Vercel — Sign Up](https://vercel.com/signup)  
- Cadastro com **GitHub**, **GitLab** ou **Bitbucket** (recomendado) ou com e-mail.

### O que fazer

1. Acesse o link e escolha **“Continue with GitHub”** (ou outro).
2. Autorize a Vercel a acessar seus repositórios.
3. Depois do login: **“Add New…” → “Project”** (ou “Import Project”).
4. Conecte o repositório onde está o ArchiSuite (ex.: `arqhub`).
5. A Vercel detecta Next.js; deixe **Framework Preset: Next.js** e **Root Directory** em branco (ou `./`).
6. Em **Environment Variables** (Variáveis de ambiente):
   - Nome: `GEMINI_API_KEY`  
   - Valor: a mesma chave que você colocou no `.env` local.  
   - Marque **Production**, **Preview** e **Development** se quiser que valha em todos os ambientes.
7. Clique em **Deploy**. O primeiro deploy sobe o app e gera uma URL tipo `archisuite-xxx.vercel.app`.

### Onde configurar

- **Na Vercel:**  
  **Project → Settings → Environment Variables**  
  Ali você adiciona/edita `GEMINI_API_KEY` e, no futuro, `DATABASE_URL`, etc.
- **No código:** você não coloca chave no código; só usa `process.env.GEMINI_API_KEY`. O valor fica só no `.env` (local) e nas variáveis do projeto na Vercel (produção).

**Dica:** Cada push na branch conectada pode gerar um deploy automático. A URL de produção é a que você usa para acessar o app na internet.

---

## 3. Banco de dados (quando for usar — Fase 1+)

Ainda não é obrigatório para rodar o app; use quando for implementar listagem de projetos e persistência.

### Opção A — Supabase (Postgres + opção de auth)

- **Onde ir:** [Supabase — Start your project](https://supabase.com/dashboard)  
- Crie conta (GitHub ou e-mail).
- **New project:** nome (ex. `archisuite`), senha do banco (guarde), região.
- No projeto: **Settings → Database** → em “Connection string” use **URI** (modo “Transaction” para o app).
- **Onde configurar no ArchiSuite:** no `.env` (local) e nas **Environment Variables** da Vercel:  
  `DATABASE_URL=postgresql://postgres.[ref]:[SENHA]@aws-0-[região].pooler.supabase.com:6543/postgres`

### Opção B — Vercel Postgres (Neon)

- **Onde ir:** No dashboard da Vercel, **Storage** (ou “Create Database” / “Postgres”).  
- Crie um banco Postgres; a Vercel gera a `DATABASE_URL`.
- **Onde configurar:** a própria Vercel pode injetar a variável no projeto. Se não injetar, copie a `DATABASE_URL` e coloque em **Settings → Environment Variables** do projeto.

### Opção C — Só local (SQLite)

- Não precisa criar conta em lugar nenhum.  
- **Onde configurar:** no `.env`: `DATABASE_URL=file:./data.db` (ou caminho que sua lib usar). Não use esse arquivo na Vercel em produção (servidor é efêmero); só para desenvolvimento.

### Opção D — Sua própria VM (Postgres na VM)

- Você instala o Postgres na sua VM e o app conecta nele (ou a Vercel conecta no IP da VM, se o app estiver na Vercel).
- **Onde configurar:** no `.env`: `DATABASE_URL=postgresql://usuario:senha@IP_OU_HOST_DA_VM:5432/archisuite`. Na VM, criar usuário e banco (ver **`docs/VM-SETUP.md`**).
- Guia completo: **`docs/VM-SETUP.md`** (Cenário A = app + banco na VM; Cenário B = app na Vercel, banco na VM).

---

## 4. Storage de arquivos (quando for usar — upload de plantas/PDFs)

### Opção A — Vercel Blob

- **Onde ir:** No projeto na Vercel, **Storage → Create Database / Blob Store** (ou “Blob”).  
- Crie o store; a Vercel adiciona variáveis como `BLOB_READ_WRITE_TOKEN`.
- **Onde configurar:** variáveis já vêm no projeto. No código use o SDK da Vercel Blob (documentação no site da Vercel).

### Opção B — AWS S3

- **Onde ir:** [AWS — Create account](https://aws.amazon.com/) e depois **S3** no console.  
- Crie um bucket (ex. `archisuite-uploads`), crie um usuário IAM com permissão nesse bucket e gere **Access Key** e **Secret Key**.
- **Onde configurar no ArchiSuite:** no `.env` e na Vercel:  
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET=archisuite-uploads`.

### Opção C — Sua própria VM (pasta no disco)

- Os arquivos ficam em uma **pasta na sua VM** (ex.: `/var/archisuite/uploads` ou `./uploads`).
- **Onde configurar:** no `.env` (na VM ou no servidor onde o app roda): `UPLOADS_DIR=/var/archisuite/uploads`. O código de upload grava nessa pasta.
- Se o app estiver na **Vercel**, o app em si não acessa o disco da VM; você precisa de uma **API na VM** que receba os uploads e salve nessa pasta. Detalhes em **`docs/VM-SETUP.md`** (Cenário B).

---

## Resumo rápido

| O que | Onde criar conta | Onde configurar no projeto |
|-------|-------------------|----------------------------|
| **Gemini (IA)** | [Google AI Studio](https://aistudio.google.com/app/apikey) | `.env`: `GEMINI_API_KEY=...` e na Vercel em **Environment Variables** |
| **Hospedagem** | [Vercel](https://vercel.com/signup) | Conectar repo + em **Settings → Environment Variables** colocar `GEMINI_API_KEY` (e depois DB/storage se usar) |
| **Banco** (depois) | [Supabase](https://supabase.com/dashboard), Vercel Postgres ou **sua VM** | `.env`: `DATABASE_URL=...` (ver `docs/VM-SETUP.md` se for VM) |
| **Arquivos** (depois) | Vercel Blob, [AWS](https://aws.amazon.com/) S3 ou **pasta na sua VM** | `.env`: `UPLOADS_DIR=...` (ver `docs/VM-SETUP.md` se for VM) |

---

## Ordem sugerida para começar

1. **Google AI Studio** → criar API key → colocar no `.env` como `GEMINI_API_KEY` → rodar `npm run dev` e testar `/api/briefing`.
2. **Vercel** → criar conta → importar o repo do ArchiSuite → adicionar `GEMINI_API_KEY` nas variáveis do projeto → Deploy.
3. Banco e storage só quando for implementar projetos persistentes e upload de arquivos (ver `docs/ROADMAP.md`).

Se algo mudar de lugar nos sites (Google, Vercel, Supabase), atualize este arquivo com o novo caminho.
