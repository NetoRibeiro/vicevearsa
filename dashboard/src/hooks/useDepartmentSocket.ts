import { useEffect, useRef, useCallback } from "react";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import type { WsMessage, ApprovalResponseMessage } from "@/types/state";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const WS_FAIL_THRESHOLD = 3;
const POLL_INTERVAL_MS = 3000;

export function useDepartmentSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setConnected = useDepartmentStore((s) => s.setConnected);
  const setSnapshot = useDepartmentStore((s) => s.setSnapshot);
  const updateDepartmentState = useDepartmentStore((s) => s.updateDepartmentState);
  const setDepartmentInactive = useDepartmentStore((s) => s.setDepartmentInactive);
  const updateAgentApproval = useDepartmentStore((s) => s.updateAgentApproval);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectDelay = RECONNECT_BASE_MS;
    let wsFailCount = 0;

    function dispatch(msg: WsMessage) {
      if (disposed) return;
      switch (msg.type) {
        case "SNAPSHOT":
          setSnapshot(msg.departments, msg.activeStates);
          break;
        case "DEPARTMENT_UPDATE":
          updateDepartmentState(msg.department, msg.state);
          break;
        case "DEPARTMENT_INACTIVE":
          setDepartmentInactive(msg.department);
          break;
        case "APPROVAL_REQUEST":
          // Update agent with approval request
          updateAgentApproval(msg.department, msg.agentId, msg.approval);
          break;
        case "APPROVAL_RESPONSE_ACK":
          // Acknowledge approval response was received by backend
          updateAgentApproval(msg.department, msg.agentId, null);
          break;
      }
    }

    // ── HTTP polling fallback ───────────────────────────────────────────

    function stopPolling() {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    function startPolling() {
      stopPolling();

      const poll = async () => {
        if (disposed) return;
        try {
          const res = await fetch("/api/snapshot", { cache: "no-store" });
          if (!res.ok || disposed) return;
          const msg: WsMessage = await res.json();
          dispatch(msg);
          setConnected(true);
        } catch {
          // Endpoint not available — will retry on next interval
        }
      };

      poll();
      pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }

    // ── WebSocket connection ────────────────────────────────────────────

    function connect() {
      if (disposed) return;

      if (reconnectTimer !== undefined) {
        clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/__departments_ws`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed) { ws.close(); return; }
        setConnected(true);
        reconnectDelay = RECONNECT_BASE_MS;
        wsFailCount = 0;
        stopPolling();
      };

      ws.onmessage = (event) => {
        if (disposed) return;
        try {
          const msg: WsMessage = JSON.parse(event.data);
          dispatch(msg);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (disposed) return;

        setConnected(false);
        wsFailCount++;

        if (wsFailCount >= WS_FAIL_THRESHOLD) {
          startPolling();
        }

        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
          connect();
        }, reconnectDelay);
      };

      ws.onerror = () => {
        // onerror is always followed by onclose — just let onclose handle it.
        // Don't call ws.close() here to avoid "closed before established" in StrictMode.
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
      stopPolling();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [setConnected, setSnapshot, updateDepartmentState, setDepartmentInactive, updateAgentApproval]);

  // Function for components to send approval responses back to server
  const sendApprovalResponse = useCallback(
    (response: ApprovalResponseMessage) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(response));
      }
    },
    []
  );

  return { sendApprovalResponse };
}
