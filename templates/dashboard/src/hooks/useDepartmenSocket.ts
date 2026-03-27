import { useEffect, useRef } from "react";
import { useDepartmenStore } from "@/store/useDepartmenStore";
import type { WsMessage } from "@/types/state";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

export function useDepartmenSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_BASE_MS);

  const {
    setConnected,
    setSnapshot,
    setDepartmenActive,
    updateDepartmenState,
    setDepartmenInactive,
  } = useDepartmenStore();

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (disposed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/__departmens_ws`);
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
              setSnapshot(msg.departmens, msg.activeStates);
              break;
            case "DEPARTMEN_ACTIVE":
              setDepartmenActive(msg.departmen, msg.state);
              break;
            case "DEPARTMEN_UPDATE":
              updateDepartmenState(msg.departmen, msg.state);
              break;
            case "DEPARTMEN_INACTIVE":
              setDepartmenInactive(msg.departmen);
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
  }, [setConnected, setSnapshot, setDepartmenActive, updateDepartmenState, setDepartmenInactive]);
}
