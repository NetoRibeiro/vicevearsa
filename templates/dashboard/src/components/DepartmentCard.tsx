import type { DepartmentInfo, DepartmentState } from "@/types/state";
import { StatusBadge } from "./StatusBadge";

interface DepartmentCardProps {
  department: DepartmentInfo;
  state: DepartmentState | undefined;
  isSelected: boolean;
  onSelect: () => void;
}

export function DepartmentCard({ department, state, isSelected, onSelect }: DepartmentCardProps) {
  const isActive = !!state;
  const status = state?.status ?? "inactive";

  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "10px 12px",
        border: "none",
        borderLeft: isSelected ? "3px solid var(--accent-cyan)" : "3px solid transparent",
        background: isSelected ? "var(--bg-secondary)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontFamily: "inherit",
        transition: "all 0.15s ease",
      }}
    >
      <StatusBadge status={status} />
      <span style={{ marginRight: 4 }}>{department.icon}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {department.name}
      </span>
      {state?.step && (
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          {state.step.current}/{state.step.total}
        </span>
      )}
    </button>
  );
}
