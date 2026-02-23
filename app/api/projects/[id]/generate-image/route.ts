import { NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import { extractRoomsFromMetricData, generateLayoutSummary } from "@/lib/gemini";
import {
  buildImagePrompt,
  buildRoomImagePrompt,
  buildRoom360Prompt,
  generateEnvironmentImage,
  type ImageType,
} from "@/lib/imagen";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = process.env.UPLOADS_DIR || "./uploads";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }

    const metricData = project.metric_data?.trim();
    if (!metricData) {
      return NextResponse.json(
        { error: "Preencha os dados métricos do projeto antes de gerar a imagem." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const typeParam = body?.type;
    const isAll = typeParam === "all";
    const isAllRooms = typeParam === "all-rooms";
    const isAllRooms360 = typeParam === "all-rooms-360";

    const projectDir = path.join(UPLOADS_DIR, id);
    await fs.mkdir(projectDir, { recursive: true });

    const images: { type: string; url: string; filename: string }[] = [];

    if (isAllRooms360) {
      const [rooms, layoutSummary] = await Promise.all([
        extractRoomsFromMetricData(metricData),
        generateLayoutSummary(metricData),
      ]);
      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "Não foi possível extrair cômodos do texto. Inclua nomes de ambientes e áreas (ex.: Sala 21m², Quarto 11m²)." },
          { status: 400 }
        );
      }
      const CONCURRENCY = 2;
      for (let i = 0; i < rooms.length; i += CONCURRENCY) {
        const batch = rooms.slice(i, i + CONCURRENCY);
        const results = await Promise.all(
          batch.map(async (room) => {
            const prompt = buildRoom360Prompt(room, metricData, undefined, layoutSummary);
            const { imageBase64, mimeType } = await generateEnvironmentImage(prompt, {
              aspectRatio: "21:9",
            });
            const ext = mimeType === "image/png" ? "png" : "jpg";
            const safe = room.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
            const filename = `generated-360-room-${safe}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
            return { room, imageBase64, ext, filename };
          })
        );
        for (const r of results) {
          const filePath = path.join(projectDir, r.filename);
          await fs.writeFile(filePath, Buffer.from(r.imageBase64, "base64"));
          images.push({
            type: `360-room:${r.room}`,
            url: `/api/projects/${id}/generated/${r.filename}`,
            filename: r.filename,
          });
        }
      }
      return NextResponse.json({ ok: true, images });
    }

    if (isAllRooms) {
      const [rooms, layoutSummary] = await Promise.all([
        extractRoomsFromMetricData(metricData),
        generateLayoutSummary(metricData),
      ]);
      if (rooms.length === 0) {
        return NextResponse.json(
          { error: "Não foi possível extrair cômodos do texto. Inclua nomes de ambientes e áreas (ex.: Sala 21m², Quarto 11m²)." },
          { status: 400 }
        );
      }
      for (const room of rooms) {
        const prompt = buildRoomImagePrompt(room, metricData, undefined, layoutSummary);
        const { imageBase64, mimeType } = await generateEnvironmentImage(prompt, {
          aspectRatio: "16:9",
        });
        const ext = mimeType === "image/png" ? "png" : "jpg";
        const safe = room.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
        const filename = `generated-room-${safe}-${Date.now()}.${ext}`;
        const filePath = path.join(projectDir, filename);
        await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));
        images.push({ type: `room:${room}`, url: `/api/projects/${id}/generated/${filename}`, filename });
      }
      return NextResponse.json({ ok: true, images });
    }

    const types: ImageType[] = isAll
      ? ["top-down", "perspective", "360"]
      : ["top-down", "perspective", "360"].includes(typeParam) ? [typeParam] : ["top-down"];

    const layoutSummary = isAll ? await generateLayoutSummary(metricData) : undefined;

    for (const type of types) {
      const prompt = buildImagePrompt(type, metricData, undefined, layoutSummary);
      const { imageBase64, mimeType } = await generateEnvironmentImage(prompt, {
        aspectRatio: type === "360" ? "21:9" : "16:9",
      });
      const ext = mimeType === "image/png" ? "png" : "jpg";
      const filename = `generated-${type}-${Date.now()}.${ext}`;
      const filePath = path.join(projectDir, filename);
      await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));
      images.push({ type, url: `/api/projects/${id}/generated/${filename}`, filename });
    }

    if (images.length === 1) {
      return NextResponse.json({ ok: true, filename: images[0].filename, url: images[0].url });
    }
    return NextResponse.json({ ok: true, images });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const isQuota =
      raw.includes("429") ||
      raw.includes("quota") ||
      raw.includes("RESOURCE_EXHAUSTED") ||
      raw.includes("limit: 0");
    const message = isQuota
      ? "Limite gratuito de geração de imagens atingido ou não disponível. Verifique seu uso em https://ai.dev/rate-limit ou ative o billing no Google Cloud para usar Imagen."
      : raw.slice(0, 500);
    const status = isQuota ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
