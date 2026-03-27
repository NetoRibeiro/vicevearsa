import { useDepartmentSocket } from "@/hooks/useDepartmentSocket";
import { DepartmentSelector } from "@/components/DepartmentSelector";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";

export function App() {
  useDepartmentSocket();

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
        <DepartmentSelector />
        <OfficeScene />
      </div>

      {/* Footer */}
      <StatusBar />
    </div>
  );
}
