import { NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/db";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json(projects);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar projetos.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const client_name = body?.client_name?.trim();
    if (!name || !client_name) {
      return NextResponse.json(
        { error: "Envie name e client_name." },
        { status: 400 }
      );
    }
    const project = await createProject({ name, client_name: client_name });
    return NextResponse.json(project);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar projeto.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
