import { useEffect, useState } from "react";

interface Settings {
  userName: string;
  language: string;
  notificationsEnabled: boolean;
}

export function SettingsPage({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    userName: "",
    language: "English",
    notificationsEnabled: "Notification" in window && Notification.permission === "granted",
  });

  useEffect(() => {
    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          userName: data.userName || "",
          language: data.language || "English",
        }));
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: settings.userName,
        companyName: "",
        companyUrl: "",
        companyDescription: "",
      }),
    });
    onClose();
  }

  function handleNotificationToggle() {
    if (!settings.notificationsEnabled) {
      Notification.requestPermission().then((perm) => {
        setSettings((prev) => ({ ...prev, notificationsEnabled: perm === "granted" }));
      });
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text-primary)",
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-sidebar)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 28,
          width: 400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, marginBottom: 20, color: "var(--accent-cyan)" }}>Settings</h2>

        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Name</label>
        <input
          style={{ ...inputStyle, marginBottom: 16 }}
          value={settings.userName}
          onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
        />

        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Language</label>
        <select
          style={{ ...inputStyle, marginBottom: 16 }}
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
        >
          <option value="English">English</option>
          <option value="Português (Brasil)">Portugues (Brasil)</option>
          <option value="Español">Espanol</option>
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={handleNotificationToggle}
          />
          <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Desktop notifications</label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 4,
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              background: "var(--accent-cyan)",
              border: "none",
              borderRadius: 4,
              color: "#000",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
