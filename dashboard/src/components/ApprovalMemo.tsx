import { useState, useCallback } from "react";
import type { Agent, Approval } from "@/types/state";

interface ApprovalMemoProps {
  agent: Agent;
  approval: Approval;
  department: string;
  onApprove: () => void;
  onRevise: (instruction: string) => void;
  onClose: () => void;
}

export function ApprovalMemo({
  agent,
  approval,
  onApprove,
  onRevise,
  onClose,
}: ApprovalMemoProps) {
  const [reviseText, setReviseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = useCallback(async () => {
    setIsSubmitting(true);
    try {
      onApprove();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [onApprove, onClose]);

  const handleRevise = useCallback(async () => {
    if (!reviseText.trim()) return;
    setIsSubmitting(true);
    try {
      onRevise(reviseText);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [reviseText, onRevise, onClose]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && reviseText.trim() && !isSubmitting) {
      handleRevise();
    }
  };

  const requestedTime = new Date(approval.requestedAt).toLocaleString();
  const cardWidth = 420;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: cardWidth,
        backgroundColor: "#1a1a2e",
        border: "1px solid #FFD700",
        borderRadius: 4,
        padding: 16,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 12,
        color: "#e0e0e0",
        zIndex: 1000,
        animation: "slideInRight 0.3s ease-out",
        boxShadow: "0 0 20px rgba(255, 215, 0, 0.2)",
      }}
    >
      {/* Memo Header */}
      <div
        style={{
          fontWeight: "bold",
          textAlign: "center",
          borderBottom: "1px solid #FFD700",
          paddingBottom: 8,
          marginBottom: 12,
          color: "#FFD700",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        INTERNAL DEPARTMENT MEMORANDUM
      </div>

      {/* Memo Body */}
      <div style={{ marginBottom: 12 }}>
        {/* TO field */}
        <div style={{ display: "flex", marginBottom: 4 }}>
          <span style={{ width: 60, fontWeight: "bold", color: "#FFD700" }}>
            TO:
          </span>
          <span style={{ flex: 1, color: "#e0e0e0" }}>Department Lead</span>
        </div>

        {/* FROM field */}
        <div style={{ display: "flex", marginBottom: 4 }}>
          <span style={{ width: 60, fontWeight: "bold", color: "#FFD700" }}>
            FROM:
          </span>
          <span style={{ flex: 1, color: "#e0e0e0" }}>
            {agent.name} {agent.icon}
          </span>
        </div>

        {/* DATE field */}
        <div style={{ display: "flex", marginBottom: 12 }}>
          <span style={{ width: 60, fontWeight: "bold", color: "#FFD700" }}>
            DATE:
          </span>
          <span style={{ flex: 1, color: "#e0e0e0", fontSize: 11 }}>
            {requestedTime}
          </span>
        </div>

        {/* CONTEXT section */}
        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <div
            style={{
              fontWeight: "bold",
              color: "#FFD700",
              marginBottom: 4,
              fontSize: 11,
            }}
          >
            CONTEXT:
          </div>
          <p
            style={{
              margin: 0,
              lineHeight: 1.4,
              color: "#d0d0d0",
              fontSize: 11,
              whiteSpace: "pre-wrap",
            }}
          >
            {approval.context}
          </p>
        </div>

        {/* APPROVAL NEEDED section */}
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontWeight: "bold",
              color: "#FFD700",
              marginBottom: 4,
              fontSize: 11,
            }}
          >
            APPROVAL NEEDED:
          </div>
          <p
            style={{
              margin: 0,
              lineHeight: 1.4,
              color: "#d0d0d0",
              fontSize: 11,
              whiteSpace: "pre-wrap",
            }}
          >
            {approval.question}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          borderTop: "1px solid #FFD700",
          paddingTop: 8,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          style={{
            flex: "0 1 auto",
            minWidth: 80,
            padding: "6px 12px",
            backgroundColor: "#00e676",
            color: "#000",
            border: "none",
            borderRadius: 3,
            fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            opacity: isSubmitting ? 0.6 : 1,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#26ff89";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#00e676";
          }}
        >
          ✓ Approve
        </button>

        <input
          type="text"
          placeholder="Revise: ..."
          value={reviseText}
          onChange={(e) => setReviseText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
          style={{
            flex: 1,
            minWidth: 120,
            padding: "6px 8px",
            backgroundColor: "#0a0a10",
            border: "1px solid #FFD700",
            color: "#e0e0e0",
            borderRadius: 3,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            opacity: isSubmitting ? 0.6 : 1,
          }}
        />

        <button
          onClick={handleRevise}
          disabled={!reviseText.trim() || isSubmitting}
          style={{
            flex: "0 1 auto",
            minWidth: 80,
            padding: "6px 12px",
            backgroundColor: reviseText.trim() && !isSubmitting ? "#FFD700" : "#666",
            color: "#000",
            border: "none",
            borderRadius: 3,
            fontWeight: "bold",
            cursor:
              reviseText.trim() && !isSubmitting ? "pointer" : "not-allowed",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            opacity: isSubmitting ? 0.6 : 1,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (reviseText.trim() && !isSubmitting) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#FFE500";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              reviseText.trim() ? "#FFD700" : "#666";
          }}
        >
          → Revise
        </button>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(450px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
