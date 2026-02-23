import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY não definida; chamadas à IA falharão.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Gera texto com o Gemini (modelo “nano”/flash — rápido e leve).
 * Use no servidor (API routes); não exponha a API key no cliente.
 */
export async function generateWithGemini(
  prompt: string,
  options?: { model?: string }
): Promise<string> {
  if (!ai) throw new Error("GEMINI_API_KEY não configurada.");
  const model = options?.model ?? DEFAULT_MODEL;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  const text = response.text;
  if (text == null) throw new Error("Resposta vazia do Gemini.");
  return text;
}

/**
 * Exemplo para o briefing: extrair palavras-chave, estilo e restrições
 * a partir do texto que o cliente descreveu.
 */
export async function extractBriefingSummary(briefingText: string): Promise<string> {
  const prompt = `Você é um assistente para escritório de arquitetura e interiores.
A partir do texto de briefing do cliente abaixo, extraia de forma objetiva:
1. Palavras-chave (estilo, ambientes, materiais)
2. Estilo desejado (ex: contemporâneo, rústico, minimalista)
3. Restrições ou pedidos específicos (orçamento, prazos, móveis existentes)

Responda em português, em tópicos curtos. Se algo não estiver claro, indique "a definir".

Briefing do cliente:
---
${briefingText}
---`;

  return generateWithGemini(prompt);
}

/**
 * Extrai lista de cômodos/ambientes do texto de dados métricos (para gerar uma imagem por cômodo).
 * Retorna JSON array de strings, ex.: ["Sala de Estar e Cozinha", "Quarto", "Banheiro", "Varanda"]
 */
export async function extractRoomsFromMetricData(metricText: string): Promise<string[]> {
  const prompt = `You are an assistant for architecture and interior design.
From the following text (metric data / room distribution of a property), extract ONLY the list of distinct rooms or spaces (ambientes).
Return a JSON array of strings, in English, with short names. Examples: "Living room and kitchen", "Bedroom", "Bathroom", "Balcony", "Hall".
Do not include "Circulation" or "Walls" as a room. Merge "Sala de Estar/Jantar e Cozinha" into one item like "Living and dining and kitchen".
Output ONLY the JSON array, no other text. Example: ["Living and kitchen", "Bedroom", "Bathroom", "Balcony"]

Text:
---
${metricText.slice(0, 3000)}
---`;

  const raw = await generateWithGemini(prompt);
  const match = raw.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string").slice(0, 10) : [];
  } catch {
    return [];
  }
}

/**
 * Gera um resumo fixo de layout/ambientação para o projeto (mesmo apartamento em todas as visões).
 * Use antes de gerar várias imagens: todas recebem esse texto para manter cozinha, móveis e disposição iguais.
 */
export async function generateLayoutSummary(metricText: string): Promise<string> {
  const prompt = `You are an interior design assistant. Based on the following property description (metrics and room layout), write ONE short paragraph in English that FIXES the exact layout for 3D visualization. Include:
- Kitchen: where is the stove (against wall or in island?), where is the sink, is there a central island or not, and its shape.
- Living/dining: where is the sofa, dining table, TV or main focus.
- Other rooms: one line each (bed position, bathroom layout, balcony furniture).
Use the same layout in every room view: e.g. "Kitchen has stove on the north wall, no central island; living has L-shaped sofa facing the TV wall; balcony has two chairs and a small table."
Output ONLY this paragraph, no intro. Keep it under 150 words.

Property description:
---
${metricText.slice(0, 2500)}
---`;

  const raw = await generateWithGemini(prompt);
  return raw.replace(/\s+/g, " ").trim().slice(0, 800);
}
