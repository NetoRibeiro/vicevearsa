import { useEffect, useRef } from "react";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import type { WsMessage } from "@/types/state";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

export function useDepartmentSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_BASE_MS);

  const {
    setConnected,
    setSnapshot,
    setDepartmentActive,
    updateDepartmentState,
    setDepartmentInactive,
  } = useDepartmentStore();

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (disposed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/__departments_ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectDelayRef.current = RECONNECT_BASE_MS;
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          switch (msg.type) {
            case "SNAPSHOT":
              setSnapshot(msg.departments, msg.activeStates);
              break;
            case "DEPARTMENT_ACTIVE":
              setDepartmentActive(msg.department, msg.state);
              break;
            case "DEPARTMENT_UPDATE":
              updateDepartmentState(msg.department, msg.state);
              break;
            case "DEPARTMENT_INACTIVE":
              setDepartmentInactive(msg.department);
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!disposed) {
          reconnectTimer = setTimeout(() => {
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * 2,
              RECONNECT_MAX_MS
            );
            connect();
          }, reconnectDelayRef.current);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [setConnected, setSnapshot, setDepartmentActive, updateDepartmentState, setDepartmentInactive]);
}
