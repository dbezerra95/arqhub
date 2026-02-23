import { NextResponse } from "next/server";
import { extractBriefingSummary } from "@/lib/gemini";

/**
 * POST /api/briefing
 * Body: { "text": "texto do briefing do cliente" }
 * Retorna o resumo extraído pelo Gemini (palavras-chave, estilo, restrições).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body?.text;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Envie { \"text\": \"...\" } com o texto do briefing." },
        { status: 400 }
      );
    }
    const summary = await extractBriefingSummary(text.trim());
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao processar briefing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
