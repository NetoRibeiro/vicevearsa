# ViceVearsa Dashboard

Real-time visualization and approval system for ViceVearsa department execution.

## Overview

The ViceVearsa Dashboard provides:
- **Live office visualization** — See agents working at their desks with real-time status updates
- **Approval system** — Request and manage approvals for department steps
- **Department monitoring** — Track pipeline progress and handoffs between agents
- **WebSocket communication** — Bidirectional messaging with the backend runner

## Architecture

### Components

- **`src/office/OfficeScene.tsx`** — Main Pixi.js canvas rendering the office environment
- **`src/office/AgentDesk.tsx`** — Individual agent desk with animation and flash effects
- **`src/components/ApprovalMemo.tsx`** — Approval request popup/modal
- **`src/hooks/useDepartmentSocket.ts`** — WebSocket connection and message handling
- **`src/store/useDepartmentStore.ts`** — Zustand state management
- **`src/types/state.ts`** — TypeScript interfaces for dashboard state

### State Management

Department state flows through Zustand and includes:

```typescript
DepartmentState {
  department: string
  status: "idle" | "running" | "completed"
  agents: Agent[]         // With approval status
  approvals?: {
    pending: PendingApproval[]
  }
}
```

### Communication

The dashboard communicates with the backend via WebSocket (`__departments_ws`) using standardized message types:

#### Messages from Backend → Dashboard

- **`SNAPSHOT`** — Initial state load
- **`DEPARTMENT_UPDATE`** — State changes during execution
- **`APPROVAL_REQUEST`** — Agent requests approval (triggers popup)
- **`APPROVAL_RESPONSE_ACK`** — Confirmation that approval was processed

#### Messages from Dashboard → Backend

- **`APPROVAL_RESPONSE`** — User decision (approve or revise with instruction)

## Approval System

### How It Works

1. **Request** — Backend emits `APPROVAL_REQUEST` when an agent completes a step that requires approval
   ```typescript
   {
     type: "APPROVAL_REQUEST",
     department: "test-dept",
     agentId: "researcher",
     approval: {
       needed: true,
       step: "research",
       question: "Is the research comprehensive?",
       context: "5 sources, 1000+ words of content",
       requestedAt: "2026-03-28T..."
     }
   }
   ```

2. **Visual Alert** — Agent desk enters approval mode with progressive escalation:
   - **0-10 seconds**: Gold monitor flash (gold pulse around monitor)
   - **10 seconds - 10 minutes**: Red desk escalation (red glow around entire desk)
   - **10+ minutes**: System-wide escalation (all desks show red flash)

3. **Popup** — User can click the flashing desk to open the `ApprovalMemo` popup:
   - **Approve button** — Accepts the output and continues pipeline
   - **Revise button** — Sends instruction to agent for re-execution
   - **Non-blocking** — Popup is fixed position (top-right) and doesn't block canvas interaction

4. **Response** — Dashboard sends approval decision back:
   ```typescript
   {
     type: "APPROVAL_RESPONSE",
     department: "test-dept",
     agentId: "researcher",
     step: "research",
     action: "approve" | "revise",
     instruction?: "Make it more concise",  // If revise
     respondedAt: "2026-03-28T..."
   }
   ```

5. **Logging** — Approval is logged to department memory with:
   - Decision (approved/revised)
   - Response time
   - Instruction (if revised)
   - Timestamp

### Visual Escalation Details

Flash animation uses a sine wave pulse at 1-second interval:
```javascript
pulse = 0.3 + 0.3 * Math.sin((Date.now() / 1000) * Math.PI * 2)
// Results in values cycling between 0.0 and 0.6 opacity
```

**Monitor Flash** (0-10s):
- Gold color (#FFD700)
- 3px border around monitor
- Inner glow at reduced opacity
- Only affects the monitor display area

**Desk Escalation** (10s-10min):
- Red color (#FF0000)
- 2px border around entire desk cell
- Background fill at 20% opacity
- Affects the full CELL_W × CELL_H area

**System Escalation** (10min+):
- Same red styling as desk escalation
- Triggers across ALL desks with approval gates
- Indicates urgent/critical approval needed

### ApprovalMemo Component

**Props:**
```typescript
interface ApprovalMemoProps {
  agent: Agent;
  approval: Approval;
  department: string;
  onApprove: () => void;
  onRevise: (instruction: string) => void;
  onClose: () => void;
}
```

**Features:**
- Official memo format (TO/FROM/DATE/CONTEXT/APPROVAL NEEDED)
- Green approve button (#00e676, hover #26ff89)
- Yellow revise button (#FFD700, hover #FFE500)
- Text input for revision instructions
- Enter key support for quick submission
- Slide-in animation from right (450px → 0 in 0.3s)
- Inline CSS for UI isolation
- Non-blocking (fixed position, high z-index)

### Interactive Desks

Clicking a desk with a pending approval:
1. Sets desk as "interactive" (pointer cursor)
2. Triggers `onDeskClick` callback
3. Opens `ApprovalMemo` popup

Clicking away from popup (or pressing close) closes the memo without sending a decision.

## Development

### Setup

```bash
npm install
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
```

### WebSocket Connection

The dashboard automatically connects to the backend WebSocket at:
```
ws://localhost:5173/__departments_ws  (or wss:// for HTTPS)
```

Reconnection logic:
- Automatic retry with exponential backoff (1s → 30s max)
- Fallback to HTTP polling if WebSocket fails 3+ times
- Polling interval: 3 seconds

### State Updates

State updates flow through Zustand store:
```typescript
useDepartmentStore((state) => ({
  setSnapshot,              // Load initial state
  updateDepartmentState,    // Update agents/progress
  updateAgentApproval,      // Set approval for agent
  selectDepartment,         // Switch department
}))
```

All state changes trigger React re-renders automatically.

## Testing

Run approval system tests:
```bash
npm test                           # Root tests (approval.test.js)
node --test tests/approval.test.js # Approval flow tests only
```

Tests cover:
- Message structure validation
- Flash animation timeline
- Pulse opacity calculations
- Approval response handling
- State tracking
- Memory log formatting

## Architecture Notes

### Why Pixi.js for Rendering?

- High-performance 2D WebGL rendering
- Smooth animations (desk flash, handoff envelope animation)
- Scales well with multiple agents
- Clean separation of rendering and state

### Why Zustand for State?

- Minimal boilerplate (no reducers)
- Fine-grained subscriptions (only re-render affected components)
- Simple patterns for async operations (socket messages)
- TypeScript-friendly

### Why WebSocket?

- Real-time bidirectional communication
- Lower latency than HTTP polling
- Single connection per client
- Natural fit for approval requests/responses

## Troubleshooting

### Approvals not appearing?

1. Check WebSocket connection (browser DevTools → Network tab)
2. Verify `APPROVAL_REQUEST` message is being sent from backend
3. Check dashboard console for errors
4. Verify `approval.needed === true` in the message

### Flash animation not showing?

1. Verify agent status is `"waiting_approval"`
2. Check that `agent.approval.needed === true`
3. Verify CSS animation is not disabled globally
4. Check GPU acceleration in browser settings

### Popup won't close?

1. Click the close button (X) in the memo
2. Click outside the memo area on the canvas
3. Check browser console for JavaScript errors

## Future Enhancements

- [ ] Approval analytics dashboard
- [ ] Bulk approval for multiple pending approvals
- [ ] Sound notification for approval requests
- [ ] Approval history/audit trail
- [ ] Department-specific approval rules
- [ ] Team approval workflows (multiple approvers)
