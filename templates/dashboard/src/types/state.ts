// state.json structure — matches Pipeline Runner output
export interface AgentDesk {
  col: number;
  row: number;
}

export type AgentStatus =
  | "idle"
  | "working"
  | "delivering"
  | "done"
  | "checkpoint";

export interface Agent {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  deliverTo: string | null;
  desk: AgentDesk;
}

export interface Handoff {
  from: string;
  to: string;
  message: string;
  completedAt: string;
}

export type DepartmenStatus =
  | "idle"
  | "running"
  | "completed"
  | "checkpoint";

export interface DepartmenState {
  departmen: string;
  status: DepartmenStatus;
  step: {
    current: number;
    total: number;
    label: string;
  };
  agents: Agent[];
  handoff: Handoff | null;
  startedAt: string | null;
  updatedAt: string;
}

// Departmen metadata from departmen.yaml
export interface DepartmenInfo {
  code: string;
  name: string;
  description: string;
  icon: string;
  agents: string[]; // agent file paths
}

// WebSocket messages
export type WsMessage =
  | { type: "SNAPSHOT"; departmens: DepartmenInfo[]; activeStates: Record<string, DepartmenState> }
  | { type: "DEPARTMEN_ACTIVE"; departmen: string; state: DepartmenState }
  | { type: "DEPARTMEN_UPDATE"; departmen: string; state: DepartmenState }
  | { type: "DEPARTMEN_INACTIVE"; departmen: string };
