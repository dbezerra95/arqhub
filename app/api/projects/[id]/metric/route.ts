import { NextResponse } from "next/server";
import { getProject, setProjectMetricData } from "@/lib/db";

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
    return NextResponse.json({ metric_data: project.metric_data ?? "" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao buscar dados.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    const body = await request.json();
    const metric_data = typeof body?.metric_data === "string" ? body.metric_data : "";
    await setProjectMetricData(id, metric_data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar dados.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
