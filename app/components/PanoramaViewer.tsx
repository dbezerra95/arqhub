"use client";

import "@photo-sphere-viewer/core/index.css";
import dynamic from "next/dynamic";

const ReactPhotoSphereViewer = dynamic(
  () => import("react-photo-sphere-viewer").then((m) => m.ReactPhotoSphereViewer),
  { ssr: false }
);

type PanoramaItem = { type: string; url: string };

export function PanoramaViewer({
  items,
  selectedUrl,
  onSelect,
}: {
  items: PanoramaItem[];
  selectedUrl: string;
  onSelect: (url: string) => void;
}) {
  if (items.length === 0) return null;

  const label = (item: PanoramaItem) =>
    item.type === "360" ? "Visão 360° (geral)" : item.type.startsWith("360-room:") ? item.type.replace(/^360-room:/, "") : item.type;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      {items.length > 1 && (
        <select
          value={selectedUrl}
          onChange={(e) => onSelect(e.target.value)}
          style={{
            marginBottom: "0.75rem",
            padding: "0.4rem 0.6rem",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: "0.875rem",
          }}
        >
          {items.map((item) => (
            <option key={item.url} value={item.url}>
              {label(item)}
            </option>
          ))}
        </select>
      )}
      <div style={{ height: 360, borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
        <ReactPhotoSphereViewer
          src={selectedUrl}
          height="360px"
          width="100%"
        />
      </div>
    </div>
  );
}
