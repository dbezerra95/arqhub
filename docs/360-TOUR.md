# Tour 360° — navegação pelo imóvel

## Objetivo

Permitir que o cliente “ande” pelo imóvel: abrir uma visão 360° em cada ambiente e, a partir dela, navegar para o próximo cômodo (hotspots) ou ver um tour contínuo.

## O que já existe

- Geração de **uma** imagem 360° (equirectangular) por projeto (visão geral).
- Geração de **uma imagem por cômodo** (perspectiva), com cômodos extraídos do texto métrico.

## Caminhos possíveis

### 1. Vários 360° (um por cômodo)

- Extrair cômodos do `metric_data` (já feito para “imagem por cômodo”).
- Para cada cômodo, gerar **além** da perspectiva um 360° equirectangular (mesmo prompt guard-rail, tipo `360`).
- Salvar como `generated-360-{roomSlug}-{ts}.png`.
- Na UI: lista de cômodos; ao clicar, abrir um viewer 360° só daquele ambiente.

### 2. Viewer 360° na interface

- **Biblioteca:** por exemplo [Photo-Sphere-Viewer](https://github.com/mistic100/Photo-Sphere-Viewer) (JS) ou [react-photo-sphere-viewer](https://www.npmjs.com/package/react-photo-sphere-viewer).
- Insumo: imagem equirectangular (a que o Gemini já gera para tipo `360`).
- Comportamento: arrastar para girar, zoom; opcionalmente hotspots para “ir para sala” / “ir para quarto”.

### 3. Tour navegável (hotspots entre 360°)

- Cada cômodo tem uma imagem 360°.
- No viewer, definir **hotspots** (pontos clicáveis na esfera) que, ao clicar, trocam para a 360° do próximo cômodo (ex.: “Porta → Quarto”).
- Dados necessários: lista de ambientes + qual 360° mostrar + links entre ambientes (grafo simples: “Sala ↔ Quarto”, “Sala ↔ Cozinha”). O grafo pode ser fixo por projeto ou inferido (ex.: “Sala conecta a todos”).

### 4. Tour “automático”

- Sequência fixa (ex.: Hall → Sala → Cozinha → Quarto → Banheiro).
- Player que avança a cada X segundos ou por seta “Próximo / Anterior”, trocando a 360° exibida no mesmo viewer.

## Recomendações

1. **Curto prazo:** adicionar geração de **360° por cômodo** (reuso do fluxo de cômodos + tipo `360`) e uma página ou modal com **um** viewer 360° (Photo-Sphere-Viewer) para a imagem 360° geral ou para a 360° do cômodo selecionado.
2. **Médio prazo:** tela “Tour” que lista os cômodos; ao escolher um, abre o viewer com a 360° daquele cômodo; botões “Próximo / Anterior” para trocar de cômodo na sequência.
3. **Longo prazo:** hotspots na esfera 360° para transição entre cômodos (ex.: clicar na porta da sala → carrega 360° do quarto), exigindo modelar conexões entre ambientes e possivelmente posição do hotspot na equirectangular.

## Custos (Gemini)

- Cada 360° por cômodo consome 1 imagem da cota (Nano Banana 500/dia). Projeto com 5 cômodos = 5 imagens só para 360° por ambiente (além das perspectivas por cômodo, se gerar tudo).

## Referências

- [Photo-Sphere-Viewer](https://github.com/mistic100/Photo-Sphere-Viewer) — viewer 360° em JS.
- [Equirectangular panorama](https://en.wikipedia.org/wiki/Equirectangular_projection) — formato esperado pelo viewer.
