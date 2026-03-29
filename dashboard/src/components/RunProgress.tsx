import { useEffect, useState } from "react";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { StepTimeline } from "./StepTimeline";
import { ApprovalHistory } from "./ApprovalHistory";

export function RunProgress() {
  const selectedDepartment = useDepartmentStore((s) => s.selectedDepartment);
  const activeStates = useDepartmentStore((s) => s.activeStates);
  const departments = useDepartmentStore((s) => s.departments);
  const [elapsed, setElapsed] = useState(0);

  const state = selectedDepartment ? activeStates.get(selectedDepartment) : null;
  const info = selectedDepartment ? departments.get(selectedDepartment) : null;

  useEffect(() => {
    if (!state?.startedAt) {
      setElapsed(0);
      return;
    }

    const start = new Date(state.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.startedAt]);

  if (!state || !info || state.status === "idle") return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const hasApprovalPending = (state.approvals?.pending?.length ?? 0) > 0;

  return (
    <div
      style={{
        width: 220,
        minWidth: 220,
        height: "100%",
        background: "var(--bg-sidebar)",
        borderLeft: "1px solid var(--border)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflowY: "auto",
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 8 }}>
          Running
        </div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {info.icon} {info.name}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
          <span>Step {state.step.current} of {state.step.total}</span>
          <span>{timeStr}</span>
        </div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${(state.step.current / state.step.total) * 100}%`,
              background: hasApprovalPending ? "var(--accent-amber)" : "var(--accent-cyan)",
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Approval banner */}
      {hasApprovalPending && (
        <div
          style={{
            padding: 10,
            background: "rgba(255, 171, 0, 0.1)",
            border: "1px solid var(--accent-amber)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--accent-amber)",
            textAlign: "center",
            animation: "pulse 2s infinite",
          }}
        >
          Waiting for your approval
        </div>
      )}

      {/* Step timeline */}
      <StepTimeline
        currentStep={state.step.current}
        totalSteps={state.step.total}
        currentLabel={state.step.label}
      />

      {/* Active agent */}
      {state.agents.filter((a) => a.status === "working").map((agent) => (
        <div key={agent.id} style={{ fontSize: 11, color: "var(--accent-cyan)" }}>
          {agent.icon} {agent.name} is working...
        </div>
      ))}

      <ApprovalHistory />
    </div>
  );
}
