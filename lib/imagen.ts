import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/** Flash: 500/dia. Pro: 20/dia, mais qualidade. Defina GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview para usar Pro. */
const IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL === "gemini-3-pro-image-preview"
    ? "gemini-3-pro-image-preview"
    : "gemini-2.5-flash-image";

export type ImageType = "top-down" | "perspective" | "360" | "room";

/** Guard-rail: padrão fixo em todas as gerações para manter consistência e evitar artefatos. */
const GUARD_RAIL =
  "Professional architectural visualization. Consistent style: photorealistic 3D render, neutral natural lighting, no people, no text or labels, clean interior, realistic proportions. Single coherent space. No black areas, voids, or unrendered regions; fill the entire frame with visible interior (walls, floor, ceiling, furniture). One continuous image from a single viewpoint: no visible seam, stitch line, or vertical split; no dark bars, bands, rectangles, or crop lines at top, bottom, corners, or sides; no semicircular or circular black hole at the bottom (show continuous floor). ";

/** Texto único de layout (mesmo em todas as visões) para manter cozinha/móveis consistentes. */
const layoutPrefix = (summary: string) =>
  `Use this exact layout for the entire project—all views must match: ${summary.slice(0, 500)}. `;

/**
 * Monta prompt em inglês para geração de imagem do ambiente (com guard-rail).
 * layoutSummary: se informado, todas as visões usam o mesmo layout (evita fogão na ilha em uma e na parede em outra).
 */
export function buildImagePrompt(
  type: ImageType,
  metricData: string,
  styleHint?: string,
  layoutSummary?: string
): string {
  const style = styleHint?.trim() || "modern, neutral colors, clean";
  const layout = layoutSummary ? layoutPrefix(layoutSummary) : "";
  const base = `${layout}Interior design, ${style}. ${metricData.replace(/\s+/g, " ").trim().slice(0, 800)}.`;

  switch (type) {
    case "top-down":
      return `${GUARD_RAIL}Top-down bird's eye view, 2D architectural floor plan style, furniture layout visible from above. ${base}`;
    case "perspective":
      return `${GUARD_RAIL}Wide angle view, single interior space. ${base} 4K, detailed. No black rectangles, patches, or voids in corners or edges; full frame filled with scene.`;
    case "360":
      return `${GUARD_RAIL}360 degree equirectangular panorama, single interior space, immersive. Critical: one seamless image, no vertical seam or stitch; no black rectangle, patch, or semicircular void anywhere (especially not at bottom center or corners); 2:1 aspect ratio, full 360° wrap, floor and ceiling visible and continuous—no black holes. ${base}`;
    case "room":
      return `${GUARD_RAIL}Wide angle view, single room. ${base} 4K.`;
    default:
      return GUARD_RAIL + base;
  }
}

/**
 * Prompt focado em um único cômodo (para gerar imagem por ambiente).
 * layoutSummary: mantém o mesmo apartamento em todas as salas (ex.: fogão sempre na parede).
 */
export function buildRoomImagePrompt(
  roomName: string,
  metricData: string,
  styleHint?: string,
  layoutSummary?: string
): string {
  const style = styleHint?.trim() || "modern, neutral colors, clean";
  const layout = layoutSummary ? layoutPrefix(layoutSummary) : "";
  const base = metricData.replace(/\s+/g, " ").trim().slice(0, 600);
  return `${GUARD_RAIL}${layout}Single room only: ${roomName}. Interior design, ${style}. Context: ${base}. Wide angle, photorealistic 3D render, 4K. No black rectangles, patches, or voids in corners or bottom; fill entire frame with room content.`;
}

/**
 * Prompt para 360° equirectangular de um único cômodo (tour navegável).
 * layoutSummary: mesmo layout em todos os cômodos do tour.
 */
export function buildRoom360Prompt(
  roomName: string,
  metricData: string,
  styleHint?: string,
  layoutSummary?: string
): string {
  const style = styleHint?.trim() || "modern, neutral colors, clean";
  const layout = layoutSummary ? layoutPrefix(layoutSummary) : "";
  const base = metricData.replace(/\s+/g, " ").trim().slice(0, 600);
  return `${GUARD_RAIL}${layout}360 degree equirectangular panorama, single room only: ${roomName}. Interior design, ${style}. Context: ${base}. Critical: single seamless image, no center seam or stitch; no black rectangle, patch, or semicircular void at bottom or corners; 2:1 aspect ratio, full 360° coverage, floor and ceiling continuous—no black holes or unrendered areas. Immersive, photorealistic.`;
}

/**
 * Gera uma imagem com Nano Banana (Flash 500/dia ou Pro 20/dia, conforme GEMINI_IMAGE_MODEL).
 * Para 360° use aspectRatio "21:9" (mais largo) para reduzir faixa preta no viewer.
 */
export async function generateEnvironmentImage(
  prompt: string,
  options?: { aspectRatio?: string }
): Promise<{ imageBase64: string; mimeType: string }> {
  if (!ai) throw new Error("GEMINI_API_KEY não configurada.");

  const config: { responseModalities: typeof Modality.IMAGE[]; imageConfig?: { aspectRatio: string } } = {
    responseModalities: [Modality.IMAGE],
  };
  if (options?.aspectRatio) {
    config.imageConfig = { aspectRatio: options.aspectRatio };
  }

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config,
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts?.length) {
    const feedback = response.promptFeedback?.blockReason;
    throw new Error(
      feedback
        ? `Geração bloqueada: ${feedback}. Tente um prompt mais simples.`
        : "Nenhuma imagem retornada. Tente outro tipo."
    );
  }

  for (const part of parts) {
    const blob = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (blob?.data) {
      return {
        imageBase64: blob.data,
        mimeType: blob.mimeType || "image/png",
      };
    }
  }

  throw new Error("Resposta sem imagem.");
}
