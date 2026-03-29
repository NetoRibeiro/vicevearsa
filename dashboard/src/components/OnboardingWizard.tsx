import { useState } from "react";

type Step = "welcome" | "company" | "loading" | "done";

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("welcome");
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text-primary)",
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 24px",
    background: "var(--accent-cyan)",
    border: "none",
    borderRadius: 6,
    color: "#000",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };

  async function handleSave() {
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, companyName, companyUrl, companyDescription }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setStep("done");
      setTimeout(onComplete, 1500);
    } catch {
      setError("Failed to save. Please try again.");
      setStep("company");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          width: 420,
          padding: 32,
          background: "var(--bg-sidebar)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        {step === "welcome" && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 8, color: "var(--accent-cyan)" }}>
              Welcome to ViceVearsa
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
              Let's set up your workspace. What's your name?
            </p>
            <input
              style={inputStyle}
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && userName.trim() && setStep("company")}
              autoFocus
            />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{ ...buttonStyle, opacity: userName.trim() ? 1 : 0.4 }}
                disabled={!userName.trim()}
                onClick={() => setStep("company")}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === "company" && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 8, color: "var(--accent-cyan)" }}>
              Your company
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
              This helps ViceVearsa tailor content to your brand.
            </p>
            <input
              style={{ ...inputStyle, marginBottom: 12 }}
              placeholder="Company / brand name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoFocus
            />
            <input
              style={{ ...inputStyle, marginBottom: 12 }}
              placeholder="Website URL (optional)"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
            />
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              placeholder="Brief description of what you do (optional)"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
            />
            {error && (
              <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 8 }}>{error}</p>
            )}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <button
                style={{ ...buttonStyle, background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                onClick={() => setStep("welcome")}
              >
                Back
              </button>
              <button
                style={{ ...buttonStyle, opacity: companyName.trim() ? 1 : 0.4 }}
                disabled={!companyName.trim()}
                onClick={handleSave}
              >
                Finish
              </button>
            </div>
          </>
        )}

        {step === "loading" && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, animation: "pulse 1.5s infinite" }}>
              Setting up your workspace...
            </p>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <p style={{ color: "var(--accent-green)", fontSize: 16, fontWeight: 600 }}>
              You're all set!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
