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
  | "checkpoint"
  | "waiting_approval"; // New: agent waiting for user approval

export interface Approval {
  needed: boolean;
  step: string; // Step label requiring approval
  question: string; // What to approve
  context: string; // Why approval needed
  requestedAt: string; // ISO timestamp
  flashed?: boolean; // Monitor flash active
  escalatedAt?: string | null; // When desk escalation started
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  deliverTo: string | null;
  desk: AgentDesk;
  approval?: Approval; // New: approval request if waiting
}

export interface Handoff {
  from: string;
  to: string;
  message: string;
  completedAt: string;
}

export type DepartmentStatus =
export type DepartmentStatus =
  | "idle"
  | "running"
  | "completed"
  | "checkpoint";

export interface PendingApproval {
  agentId: string;
  step: string;
  requestedAt: string;
  escalatedAt: string | null;
  clickedAt: string | null;
}

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
  approvals?: {
    // New: track pending approvals
    pending: PendingApproval[];
  };
  startedAt: string | null;
  updatedAt: string;
}

// Department metadata from department.yaml
export interface DepartmentInfo {
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
  | { type: "DEPARTMENT_INACTIVE"; department: string }
  | {
      type: "APPROVAL_REQUEST";
      department: string;
      agentId: string;
      approval: Approval;
    }
  | {
      type: "APPROVAL_RESPONSE_ACK";
      department: string;
      agentId: string;
      action: "approve" | "revise";
      instruction?: string;
    };

// Client → Server approval response
export interface ApprovalResponseMessage {
  type: "APPROVAL_RESPONSE";
  department: string;
  agentId: string;
  step: string;
  action: "approve" | "revise";
  instruction?: string;
  respondedAt: string;
}
