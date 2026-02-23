import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/db";
import { ProjectDetail } from "./ProjectDetail";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#666", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Projetos
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
          {project.name}
        </h1>
        <p style={{ color: "#666", fontSize: "0.9375rem" }}>
          Cliente: {project.client_name} · {project.status}
        </p>
      </header>

      <ProjectDetail project={project} />
    </main>
  );
}
