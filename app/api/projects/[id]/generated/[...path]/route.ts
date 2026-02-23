import { NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = process.env.UPLOADS_DIR || "./uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const { id, path: pathSegments } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    const filename = pathSegments?.join("/");
    if (!filename || filename.includes("..")) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }
    if (!filename.startsWith("generated-")) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    const filePath = path.join(UPLOADS_DIR, id, filename);
    const buf = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const types: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const contentType = types[ext] || "image/png";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
}
