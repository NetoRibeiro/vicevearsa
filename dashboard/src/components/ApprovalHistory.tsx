import { useEffect, useState } from "react";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import type { ApprovalHistoryEntry } from "@/types/state";

export function ApprovalHistory() {
  const selectedDepartment = useDepartmentStore((s) => s.selectedDepartment);
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);

  useEffect(() => {
    if (!selectedDepartment) {
      setHistory([]);
      return;
    }

    async function loadHistory() {
      try {
        const res = await fetch(`/api/departments/${selectedDepartment}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch {
        // Not available
      }
    }

    loadHistory();
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, [selectedDepartment]);

  if (history.length === 0) return null;

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 8 }}>
        Approval History
      </div>
      {history.map((entry, i) => (
        <div
          key={i}
          style={{
            fontSize: 11,
            padding: "6px 0",
            borderBottom: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: entry.action === "approve" ? "var(--accent-green)" : "var(--accent-amber)" }}>
              {entry.action === "approve" ? "\u2713 Approved" : "\u21BB Revised"}
            </span>
            <span>{new Date(entry.respondedAt).toLocaleTimeString()}</span>
          </div>
          <div>{entry.step}</div>
          {entry.instruction && (
            <div style={{ fontStyle: "italic", marginTop: 2 }}>"{entry.instruction}"</div>
          )}
        </div>
      ))}
    </div>
  );
}
