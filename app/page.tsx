import Link from "next/link";
import { listProjects } from "@/lib/db";

export default async function Home() {
  let projects: { id: string; name: string; client_name: string; status: string; file_name?: string | null; metric_data?: string | null }[] = [];
  try {
    projects = await listProjects();
  } catch {
    // DATABASE_URL não configurada ou erro de conexão
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>ArchiSuite</h1>
          <p style={{ color: "#555", marginTop: "0.25rem" }}>
            Inteligência Artificial em cada etapa do seu projeto
          </p>
        </div>
        <Link
          href="/projects/new"
          style={{
            padding: "0.5rem 1rem",
            background: "#1a1a1a",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Novo projeto
        </Link>
      </header>

      <section
        style={{
          background: "white",
          borderRadius: 8,
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Projetos</h2>
        {projects.length === 0 ? (
          <p style={{ color: "#666", fontSize: "0.9375rem" }}>
            Nenhum projeto ainda.{" "}
            <Link href="/projects/new" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
              Criar o primeiro
            </Link>
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {projects.map((p) => (
              <li
                key={p.id}
                style={{
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div>
                  <Link
                    href={`/projects/${p.id}`}
                    style={{ fontWeight: 600, color: "#1a1a1a", textDecoration: "none" }}
                  >
                    {p.name}
                  </Link>
                  <span style={{ color: "#666", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
                    — {p.client_name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.5rem",
                    background: "#f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  {p.status}
                  {p.file_name ? " · planta" : ""}
                  {p.metric_data ? " · métricas" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
