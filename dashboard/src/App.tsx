import { useEffect, useState } from "react";
import { useDepartmentSocket } from "@/hooks/useDepartmentSocket";
import { DepartmentManager } from "@/components/DepartmentManager";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { RunProgress } from "@/components/RunProgress";
import { SettingsPage } from "@/components/SettingsPage";

export function App() {
  useDepartmentSocket();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => setOnboarded(data.complete))
      .catch(() => setOnboarded(true)); // If API fails, skip onboarding
  }, []);

  // Loading state
  if (onboarded === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--bg-primary)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, animation: "pulse 1.5s infinite" }}>Loading...</p>
      </div>
    );
  }

  // Onboarding needed
  if (!onboarded) {
    return <OnboardingWizard onComplete={() => setOnboarded(true)} />;
  }

  // Main dashboard
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
          justifyContent: "space-between",
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
        <span>vicevearsa Dashboard</span>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: 16,
            padding: 4,
          }}
          title="Settings"
        >
          &#9881;
        </button>
      </header>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <DepartmentManager />
        <OfficeScene />
        <RunProgress />
      </div>

      {/* Footer */}
      <StatusBar />

      {/* Settings modal */}
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </div>
  );
}
