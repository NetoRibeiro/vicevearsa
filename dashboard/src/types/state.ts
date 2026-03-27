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

export type DepartmentStatus =
  | "idle"
  | "running"
  | "completed"
  | "checkpoint";

export interface DepartmentState {
  department: string;
  status: DepartmentStatus;
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

// Department metadata from department.yaml
export interface DepartmentInfo {
  code: string;
  name: string;
  description: string;
  icon: string;
  agents: string[]; // agent file paths
}

// WebSocket messages
export type WsMessage =
  | { type: "SNAPSHOT"; departments: DepartmentInfo[]; activeStates: Record<string, DepartmentState> }
  | { type: "DEPARTMENT_UPDATE"; department: string; state: DepartmentState }
  | { type: "DEPARTMENT_INACTIVE"; department: string };
