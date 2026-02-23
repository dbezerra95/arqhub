"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), client_name: clientName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#666", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Novo projeto
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          borderRadius: 8,
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        {error && (
          <p style={{ color: "#c00", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>
        )}
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Nome do projeto
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: "1rem",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Nome do cliente
          </span>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: "1rem",
            }}
          />
        </label>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.5rem 1.25rem",
              background: "#1a1a1a",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Criando…" : "Criar projeto"}
          </button>
          <Link
            href="/"
            style={{
              padding: "0.5rem 1rem",
              color: "#666",
              textDecoration: "none",
              alignSelf: "center",
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
