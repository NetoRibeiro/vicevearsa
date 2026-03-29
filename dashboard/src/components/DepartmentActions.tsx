import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

interface DepartmentActionsProps {
  departmentCode: string;
  departmentName: string;
  onDeleted: () => void;
}

export function DepartmentActions({ departmentCode, departmentName, onDeleted }: DepartmentActionsProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/departments/${encodeURIComponent(departmentCode)}`, { method: "DELETE" });
      if (res.ok) onDeleted();
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  const btnStyle: React.CSSProperties = {
    padding: "4px 10px",
    fontSize: 11,
    fontFamily: "inherit",
    border: "1px solid var(--border)",
    borderRadius: 4,
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        <button style={btnStyle} onClick={() => setShowDelete(true)}>
          Delete
        </button>
      </div>

      {showDelete && (
        <ConfirmModal
          title="Delete Department"
          message={`Are you sure you want to delete "${departmentName}"? This cannot be undone.`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
