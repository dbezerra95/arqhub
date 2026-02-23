import { NextResponse } from "next/server";
import { getProject } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao buscar projeto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
