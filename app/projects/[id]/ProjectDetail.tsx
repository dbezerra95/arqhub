"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

const PanoramaViewer = dynamic(
  () => import("@/app/components/PanoramaViewer").then((m) => m.PanoramaViewer),
  { ssr: false }
);

type Project = {
  id: string;
  name: string;
  client_name: string;
  status: string;
  file_name?: string | null;
  metric_data?: string | null;
};

export function ProjectDetail({ project }: { project: Project }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [metricData, setMetricData] = useState(project.metric_data ?? "");
  const [savingMetric, setSavingMetric] = useState(false);
  const [metricError, setMetricError] = useState("");
  const [metricSuccess, setMetricSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ type: string; url: string }[]>([]);
  const [generateError, setGenerateError] = useState("");
  const [selectedPanoramaUrl, setSelectedPanoramaUrl] = useState<string | null>(null);

  useEffect(() => {
    setMetricData(project.metric_data ?? "");
  }, [project.metric_data]);

  const panoramaItems = useMemo(
    () => generatedImages.filter((i) => i.type === "360" || i.type.startsWith("360-room:")),
    [generatedImages]
  );
  const otherImages = useMemo(
    () => generatedImages.filter((i) => i.type !== "360" && !i.type.startsWith("360-room:")),
    [generatedImages]
  );

  useEffect(() => {
    if (panoramaItems.length > 0 && (!selectedPanoramaUrl || !panoramaItems.some((p) => p.url === selectedPanoramaUrl))) {
      setSelectedPanoramaUrl(panoramaItems[0].url);
    }
    if (panoramaItems.length === 0) setSelectedPanoramaUrl(null);
  }, [panoramaItems, selectedPanoramaUrl]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch(`/api/projects/${project.id}/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const fileUrl = `/api/projects/${project.id}/file`;

  async function handleGenerateAll() {
    setGenerateError("");
    setGeneratedImages([]);
    setSelectedPanoramaUrl(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "all" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar imagens");
      if (data.images?.length) {
        setGeneratedImages(data.images);
        const first360 = data.images.find((i: { type: string }) => i.type === "360" || i.type.startsWith("360-room:"));
        if (first360) setSelectedPanoramaUrl(first360.url);
      } else if (data.url) {
        setGeneratedImages([{ type: "imagem", url: data.url }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar imagens.";
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateRooms() {
    setGenerateError("");
    setGeneratedImages([]);
    setSelectedPanoramaUrl(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "all-rooms" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar imagens por cômodo");
      if (data.images?.length) {
        setGeneratedImages(data.images);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar imagens por cômodo.";
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateRooms360() {
    setGenerateError("");
    setGeneratedImages([]);
    setSelectedPanoramaUrl(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "all-rooms-360" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar 360° por cômodo");
      if (data.images?.length) {
        setGeneratedImages(data.images);
        setSelectedPanoramaUrl(data.images[0]?.url ?? null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar 360° por cômodo.";
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveMetric() {
    setMetricError("");
    setMetricSuccess(false);
    setSavingMetric(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/metric`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric_data: metricData }),
      });
      const text = await res.text();
      const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
      if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao salvar`);
      setMetricSuccess(true);
      setTimeout(() => setMetricSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setMetricError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSavingMetric(false);
    }
  }

  return (
    <>
    <section
      style={{
        background: "white",
        borderRadius: 8,
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Planta ou arquivo</h2>
      {project.file_name ? (
        <div>
          <p style={{ fontSize: "0.9375rem", color: "#555", marginBottom: "0.5rem" }}>
            {project.file_name}
          </p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.4rem 0.8rem",
              background: "#f0f0f0",
              borderRadius: 6,
              fontSize: "0.875rem",
              color: "#1a1a1a",
              textDecoration: "none",
            }}
          >
            Abrir arquivo
          </a>
          <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#888" }}>
            Enviar outro arquivo substitui o atual.
          </p>
        </div>
      ) : (
        <p style={{ fontSize: "0.9375rem", color: "#666", marginBottom: "0.75rem" }}>
          Nenhum arquivo anexado.
        </p>
      )}

      <div style={{ marginTop: "1rem" }}>
        <label
          style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            background: uploading ? "#ccc" : "#1a1a1a",
            color: "white",
            borderRadius: 6,
            fontSize: "0.875rem",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Enviando…" : "Enviar planta (PDF, imagem)"}
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
        {error && (
          <p style={{ color: "#c00", fontSize: "0.875rem", marginTop: "0.5rem" }}>{error}</p>
        )}
      </div>
    </section>

    <section
      style={{
        background: "white",
        borderRadius: 8,
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        marginTop: "1.5rem",
      }}
    >
      <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Dados métricos / descrição do espaço
      </h2>
      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.75rem" }}>
        Não tem planta baixa? Cole aqui áreas (m²), dimensões e descrição dos ambientes — como no exemplo de 45m².
      </p>
      <textarea
        value={metricData}
        onChange={(e) => setMetricData(e.target.value)}
        placeholder="Ex.: Sala 21m², Quarto 11m², Banheiro 4m², Varanda 5m². Descrição da disposição..."
        rows={12}
        style={{
          width: "100%",
          padding: "0.75rem",
          border: "1px solid #ddd",
          borderRadius: 6,
          fontSize: "0.9375rem",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
      <div style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          onClick={handleSaveMetric}
          disabled={savingMetric}
          style={{
            padding: "0.5rem 1rem",
            background: savingMetric ? "#ccc" : "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: "0.875rem",
            cursor: savingMetric ? "not-allowed" : "pointer",
          }}
        >
          {savingMetric ? "Salvando…" : "Salvar dados métricos"}
        </button>
        {metricSuccess && (
          <span style={{ color: "#0a0", fontSize: "0.875rem", marginLeft: "0.75rem", fontWeight: 500 }}>
            Dados salvos.
          </span>
        )}
        {metricError && (
          <p style={{ color: "#c00", fontSize: "0.875rem", marginTop: "0.5rem" }}>{metricError}</p>
        )}
      </div>
    </section>

    <section
      style={{
        background: "white",
        borderRadius: 8,
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        marginTop: "1.5rem",
      }}
    >
      <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Gerar imagem do ambiente (IA)
      </h2>
      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
        Três visões gerais (de cima, perspectiva, 360°) ou uma imagem por cômodo. Use os dados métricos salvos. Nano Banana (500/dia).
      </p>
      {!metricData.trim() ? (
        <p style={{ fontSize: "0.875rem", color: "#888" }}>
          Salve os dados métricos acima antes de gerar.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <button
              type="button"
              onClick={handleGenerateAll}
              disabled={generating}
              style={{
                padding: "0.6rem 1.25rem",
                background: generating ? "#ccc" : "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: "0.9375rem",
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "Gerando…" : "Gerar 3 visões (geral)"}
            </button>
            <button
              type="button"
              onClick={handleGenerateRooms}
              disabled={generating}
              style={{
                padding: "0.6rem 1.25rem",
                background: generating ? "#ccc" : "#333",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: "0.9375rem",
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "Gerando…" : "Gerar por cômodo"}
            </button>
            <button
              type="button"
              onClick={handleGenerateRooms360}
              disabled={generating}
              style={{
                padding: "0.6rem 1.25rem",
                background: generating ? "#ccc" : "#444",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: "0.9375rem",
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "Gerando tour 360°…" : "Tour 360° (por cômodo)"}
            </button>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#888", marginTop: "-0.25rem", marginBottom: "0.5rem" }}>
            Tour 360° gera uma cena por cômodo (cerca de 15–30 s cada, em paralelo). Aguarde.
          </p>
          {generateError && (
            <p style={{ color: "#c00", fontSize: "0.875rem", marginTop: "0.75rem" }}>{generateError}</p>
          )}
          {generatedImages.length > 0 && (
            <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {panoramaItems.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.8125rem", color: "#666", marginBottom: "0.35rem" }}>
                    Tour 360° — arraste para girar, use o seletor para trocar de cômodo
                  </p>
                  <PanoramaViewer
                    items={panoramaItems}
                    selectedUrl={selectedPanoramaUrl ?? panoramaItems[0]?.url ?? ""}
                    onSelect={setSelectedPanoramaUrl}
                  />
                  <a
                    href={selectedPanoramaUrl ?? panoramaItems[0]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8125rem", marginTop: "0.35rem", display: "inline-block", color: "#666" }}
                  >
                    Abrir 360° em nova aba
                  </a>
                </div>
              )}
              {otherImages.map((img) => (
                <div key={img.url}>
                  <p style={{ fontSize: "0.8125rem", color: "#666", marginBottom: "0.35rem" }}>
                    {img.type === "top-down"
                      ? "Visão de cima"
                      : img.type === "perspective"
                        ? "Perspectiva"
                        : img.type.startsWith("room:")
                          ? `Cômodo: ${img.type.replace(/^room:/, "")}`
                          : img.type}
                  </p>
                  <img
                    src={img.url}
                    alt={img.type}
                    style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }}
                  />
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8125rem", marginTop: "0.35rem", display: "inline-block", color: "#666" }}
                  >
                    Abrir em nova aba
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
    </>
  );
}
