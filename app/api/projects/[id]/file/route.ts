import { NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = process.env.UPLOADS_DIR || "./uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project?.file_name) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }
    const filePath = path.join(UPLOADS_DIR, id, project.file_name);
    const buf = await fs.readFile(filePath);
    const ext = path.extname(project.file_name).toLowerCase();
    const types: Record<string, string> = {
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };
    const contentType = types[ext] || "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${project.file_name}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
}
