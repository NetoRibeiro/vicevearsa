import { useDepartmenSocket } from "@/hooks/useDepartmenSocket";
import { DepartmenSelector } from "@/components/DepartmenSelector";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";

export function App() {
  useDepartmenSocket();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 40,
          minHeight: 40,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        vicevearsa Dashboard
      </header>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <DepartmenSelector />
        <OfficeScene />
      </div>

      {/* Footer */}
      <StatusBar />
    </div>
  );
}
