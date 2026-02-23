import { NextResponse } from "next/server";
import { getProject, setProjectFile } from "@/lib/db";
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Envie um arquivo (campo 'file')." },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const projectDir = path.join(UPLOADS_DIR, id);
    await fs.mkdir(projectDir, { recursive: true });
    const filePath = path.join(projectDir, safeName);
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    await setProjectFile(id, safeName);
    return NextResponse.json({ ok: true, file_name: safeName });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro no upload.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
