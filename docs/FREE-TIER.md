# Até onde dá para ir no gratuito (MVP)

Resumo dos limites **free tier** dos serviços que o ArchiSuite usa ou pode usar. Serve para rodar o MVP sem cartão de crédito.

---

## 1. Google Gemini (IA)

**Onde:** [Google AI Studio](https://aistudio.google.com/app/apikey) — mesma chave que já está no `.env`.

| Limite | Valor típico (free) | No MVP |
|--------|----------------------|--------|
| Requisições por minuto (RPM) | ~10–15 | Evitar muitos briefings no mesmo minuto; 1–2 usuários tranquilo. |
| Requisições por dia (RPD) | ~250–500 (modelo Flash) | Dezenas de briefings por dia; suficiente para testes e primeiros clientes. |
| Tokens por minuto (TPM) | 250.000 | Briefing curto usa poucos tokens; margem grande. |

**Dica:** Se precisar de mais volume, ativar billing no Google Cloud (Tier 2) sobe bastante o RPD; até lá, o free atende um MVP tranquilo.

**Referência:** [Rate limits – Gemini API](https://ai.google.dev/gemini-api/docs/rate-limits) (e conferir seu uso em AI Studio).

---

## 2. Hospedagem do app (Next.js) — Vercel

**Plano Hobby (gratuito):**

| Recurso | Limite | No MVP |
|---------|--------|--------|
| Projetos | 200 | 1 projeto = ArchiSuite. |
| Deployments/dia | 100 | Muitos deploys por dia. |
| Invocações de função/mês | 1 milhão | APIs (ex.: `/api/briefing`) entram aqui; MVP usa pouco. |
| Build | 6.000 min/mês | Vários builds por dia sem problema. |
| Bandwidth | 100 GB | Tráfego moderado. |

**Conclusão:** MVP pode rodar 100% no free da Vercel. Se passar do limite, a Vercel pausa deploys até o mês seguinte (ou você sobe de plano).

---

## 3. Banco de dados (quando tiver)

| Serviço | Free tier | Bom para MVP? |
|---------|-----------|----------------|
| **Vercel Postgres** (Neon) | 0.5 GB, 1 projeto | Sim — projetos e usuários. |
| **Supabase** | 500 MB, 2 projetos | Sim — Postgres + auth. |
| **SQLite no repo** (ex.: Turso libsql) | local ou Turso free | Sim — para começar sem conta. |

Começar com SQLite ou Supabase/Neon free cobre Fase 1 do roadmap.

---

## 4. Storage de arquivos (quando tiver)

| Serviço | Free tier | Uso no MVP |
|---------|-----------|------------|
| **Vercel Blob** | 1 GB | PDFs/plantas dos primeiros projetos. |
| **Cloudflare R2** | 10 GB/mês egress free | Alternativa ao S3. |
| **AWS S3** | 5 GB (12 meses) | Se já tiver conta AWS. |

Para MVP, 1 GB (ex.: Vercel Blob) ou SQLite + arquivos em disco já resolve.

---

## Resumo: até onde o MVP pode ir no gratuito

- **Gemini:** dezenas de briefings por dia (até ~250–500/dia no free). Suficiente para você + primeiros clientes.
- **App:** Vercel Hobby cobre site + API; 1M invocações/mês é bastante para MVP.
- **Banco:** Supabase ou Neon free; ou SQLite para começar.
- **Arquivos:** 1 GB (Vercel Blob ou similar) ou só disco no início.

Quando o uso crescer (muitos clientes ou muitos briefings por dia), a primeira coisa a observar é o **Gemini (RPD)**; depois, invocações na Vercel e espaço de banco/storage. Até lá, dá para levar o MVP inteiro no free.

*Atualize este doc quando adicionar novos serviços (auth, email, etc.).*
