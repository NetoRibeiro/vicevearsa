import { useState, useRef } from "react";

export function BundleImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    await importFile(files[0]);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await importFile(files[0]);
  }

  async function importFile(file: File) {
    setStatus("importing");
    try {
      const res = await fetch("/api/bundles/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: file.name }),
      });
      setStatus(res.ok ? "success" : "error");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      style={{
        margin: "8px 12px",
        padding: 12,
        border: `1px dashed ${isDragging ? "var(--accent-cyan)" : "var(--border)"}`,
        borderRadius: 6,
        textAlign: "center",
        cursor: "pointer",
        fontSize: 11,
        color: isDragging ? "var(--accent-cyan)" : "var(--text-secondary)",
        transition: "all 0.2s",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        accept=".zip"
        onChange={handleFileSelect}
      />
      {status === "idle" && "Drop bundle here or click to import"}
      {status === "importing" && "Importing..."}
      {status === "success" && <span style={{ color: "var(--accent-green)" }}>Imported!</span>}
      {status === "error" && <span style={{ color: "var(--accent-red)" }}>Import failed</span>}
    </div>
  );
}
