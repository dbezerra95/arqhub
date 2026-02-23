# ArchiSuite — Roadmap

Fases para dar o start e evoluir o produto.

---

## Fase 0 — Base (agora)

- [x] README e posicionamento
- [x] Documentação (ARCHITECTURE, ROADMAP)
- [x] Estrutura mínima do repo e app
- [x] Ambiente local rodando (`npm run dev`)

**Objetivo:** Repo organizado e uma tela acessível no navegador.

---

## Fase 1 — MVP de projetos

- [x] Cadastro/listagem de **projetos** (nome, cliente, status)
- [ ] Autenticação simples (login/senha ou link mágico)
- [x] Upload de **um arquivo por projeto** (ex.: PDF da planta) → salvar em disco (UPLOADS_DIR)
- [x] Página de detalhe do projeto com arquivo anexado

**Objetivo:** Conseguir criar um projeto, anexar a planta e ver na interface.

---

## Fase 2 — Briefing com IA

- [ ] Campo de briefing (texto ou áudio → transcrição)
- [ ] Integração com IA (OpenAI/Claude): extrair palavras-chave, estilo, restrições
- [ ] Exibir resumo + tags do briefing no projeto
- [ ] (Opcional) Sugestão inicial de moodboard a partir do texto

**Objetivo:** Cliente descreve; a IA estrutura o briefing e o projeto guarda isso.

---

## Fase 3 — Portal do cliente

- [ ] Geração de **link único** por projeto para o cliente
- [ ] Página pública (sem login): galeria de imagens/renders do projeto
- [ ] Cliente pode **comentar** (texto + opcionalmente “onde” na imagem)
- [ ] Notificação ou lista de comentários no painel interno

**Objetivo:** Cliente aprova pelo link; você vê os comentários centralizados.

---

## Fase 4 — Levantamento e layout

- [ ] Múltiplos arquivos por projeto (PDF, DWG), organizados por etapa
- [ ] Metadados e medidas extraídas (manual ou automático)
- [ ] Algoritmo/IA de layout: entrada (polígono + briefing) → opções de planta
- [ ] Visualização das opções no painel

**Objetivo:** Base de levantamento sólida e primeiras opções de layout geradas por IA.

---

## Fase 5 — Orçamento

- [ ] Quantitativo do projeto (manual ou importado)
- [ ] Busca de preços (APIs ou automação controlada)
- [ ] Relatório de orçamento (PDF/Excel) por projeto

**Objetivo:** Entregar projeto + orçamento atualizado.

---

## Ordem sugerida para começar

1. **Fase 0** — Concluir (rodar o app).
2. **Fase 1** — Foco total até listar projetos e ver um upload.
3. **Fase 2** — Um fluxo de briefing + uma chamada de IA já entrega valor.
4. Depois: Fase 3 (portal) ou Fase 4 (levantamento/layout), conforme prioridade de negócio.

Atualize este arquivo conforme marcos forem concluídos.
