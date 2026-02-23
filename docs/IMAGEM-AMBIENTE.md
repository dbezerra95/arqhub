# Imagem do ambiente com Gemini / Imagen (Nano Banana)

O ArchiSuite pode gerar **imagens do ambiente** a partir dos dados métricos e do briefing, usando a API do Google (Gemini/Imagen). Duas visões fazem sentido:

1. **Visão de cima (top-down)** — como uma planta baixa renderizada: ambientes, móveis e circulação vistos de cima. Ótimo para conferir layout.
2. **Perspectiva (foto do ambiente)** — visão como se você estivesse dentro do cômodo. Ótimo para o cliente “sentir” o espaço.
3. **360°** — panorama do ambiente. Dá para tentar no prompt (“360 degree equirectangular panorama”); o resultado depende do modelo. Não todos os modelos geram 360° nativo.

---

## O que a API oferece

| Recurso | Modelo | Cota (ex.) | Uso |
|--------|--------|------------|-----|
| **Nano Banana (Gemini 2.5 Flash Image)** | `gemini-2.5-flash-image` | 500/dia | **Padrão** no ArchiSuite. |
| **Nano Banana Pro (Gemini 3 Pro Image)** | `gemini-3-pro-image-preview` | 20/dia | Maior qualidade e **mais consistência** (menos costura, menos artefatos, layout mais estável). Ative no `.env`: `GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview`. |
| **Imagen 4** | `imagen-4.0-generate-001` | Com billing | Alternativa paga. |

**Impacto do modelo:** o tipo de modelo pode afetar artefatos (costura vertical, faixas pretas, void no centro) e a **consistência** entre visões. O Flash é mais rápido e tem cota maior; o Pro tende a gerar imagens mais limpas e com layout mais coerente entre sala, cozinha e varanda. Se as imagens saírem muito diferentes entre si ou com muitos defeitos, vale testar o Pro.

Os prompts devem ser em **inglês** para melhor resultado. O ArchiSuite monta o prompt em inglês a partir dos dados do projeto (áreas, cômodos, estilo).

---

## Visão de cima (top-down)

Prompt sugerido (exemplo):

- *"Interior design, top-down bird's eye view of a 45m² apartment floor plan, modern style: integrated living room and kitchen 21m², bedroom 11m², bathroom 4m², balcony 5m², clean layout, furniture layout visible from above, 2D architectural style, high quality."*

Assim o modelo gera uma imagem “de cima”, no estilo planta/layout.

---

## Perspectiva (foto do ambiente)

Prompt sugerido (exemplo):

- *"Interior design, photorealistic 3D render of a modern 45m² apartment living room, integrated with kitchen, natural lighting, contemporary furniture, neutral colors, wide angle view, 4K, professional architectural visualization."*

Para outros cômodos, trocar “living room” por “bedroom”, “bathroom”, “balcony”.

---

## 360°

Para tentar 360°:

- *"360 degree equirectangular panorama of a modern apartment living room, interior design, photorealistic."*

O resultado varia: nem todo modelo gera panorama equirretangular de qualidade. Quando a API tiver suporte melhor a 360°, o ArchiSuite pode passar a oferecer essa opção de forma mais estável.

---

## Consistência entre visões (mesmo layout)

Para que **todas as imagens do mesmo projeto** mostrem o **mesmo apartamento** (ex.: fogão sempre na parede, nunca na ilha em uma e na parede em outra), o ArchiSuite gera um **resumo de layout** único antes de gerar várias visões:

1. Uma chamada ao Gemini (texto) produz um parágrafo em inglês que fixa: cozinha (fogão na parede ou na ilha, pia, ilha ou não), sala (sofá, mesa, TV), demais cômodos.
2. Esse texto é injetado em **todos** os prompts de imagem (3 visões gerais, por cômodo, tour 360°).

Assim, sala, cozinha e varanda passam a seguir o mesmo “brief” e o layout fica coerente. O resumo é gerado automaticamente ao clicar em “Gerar 3 visões”, “Gerar por cômodo” ou “Tour 360° (por cômodo)”.

---

## Onde está no projeto

- **Lib:** `lib/imagen.ts` — monta o prompt em inglês e chama a API (Imagen ou Gemini Flash Image).
- **API:** `POST /api/projects/[id]/generate-image` — body: `{ "type": "top-down" | "perspective" | "360" }`; usa `metric_data` e briefing do projeto; salva a imagem e devolve o caminho/URL.
- **UI:** Na página do projeto, botão(s) “Gerar imagem (visão de cima)” e “Gerar imagem (perspectiva)” (e depois “360°” quando estiver estável).

---

## Limites gratuitos

- **Gemini 2.5 Flash (texto):** costuma ter cota no free tier (ex.: briefing).
- **Gemini 2.5 Flash Image (gerar imagem):** em algumas contas/regiões o free tier pode ter **cota zero** para o modelo de imagem (`limit: 0`). Se você receber erro **429 (quota exceeded)** com "limit: 0", a geração de imagem não está disponível no seu plano gratuito.
- **O que fazer:** conferir uso e limites em [https://ai.dev/rate-limit](https://ai.dev/rate-limit) e em [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Para gerar imagens com cota garantida, ativar **billing** no Google Cloud e usar **Imagen** (pago) ou um modelo de imagem com cota no seu projeto.

Ver `docs/FREE-TIER.md` para outros limites.
