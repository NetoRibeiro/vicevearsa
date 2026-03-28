# Approval System Testing Guide

## Manual End-to-End Testing

This guide covers manual testing of the dashboard approval system.

### Prerequisites

1. **Dashboard running**: `npm run dev` in the dashboard directory
2. **Backend running**: Department runner executing with approval gates configured
3. **Browser DevTools**: Open for console and network monitoring

### Test Scenario 1: Approval Request Appears

**Objective**: Verify that approval requests from the backend trigger dashboard notifications.

**Steps**:

1. Start a department run that has a step with `approval_needed: true` in its frontmatter
2. Monitor the browser console for WebSocket messages:
   ```javascript
   // Should see in console
   {
     "type": "APPROVAL_REQUEST",
     "department": "test-dept",
     "agentId": "researcher",
     "approval": {
       "needed": true,
       "step": "research",
       "question": "...",
       "context": "...",
       "requestedAt": "2026-03-28T..."
     }
   }
   ```
3. Verify that the agent's desk in the office canvas shows a gold monitor flash (0-10 seconds)
4. Verify that the agent's name card shows a gold status dot
5. Verify that the agent status is `"waiting_approval"` in state.json

**Expected Result**:
- ✓ Console logs show APPROVAL_REQUEST message
- ✓ Agent desk shows gold monitor flash
- ✓ Name card displays gold status indicator

---

### Test Scenario 2: Flash Animation Escalation

**Objective**: Verify that flash animation escalates over time.

**Setup**:
- Have an approval gate active for 15+ minutes
- Keep browser DevTools network tab open to verify no new requests

**Timeline**:

| Time | Expected Visual | Verification |
|------|-----------------|--------------|
| 0-10s | Gold monitor flash | Pulse visible on monitor border |
| 10-600s (10min) | Red desk escalation | Red pulse around entire desk |
| 600s+ | System escalation | All desks with approvals show red (if multiple) |

**Steps**:

1. Keep the approval pending
2. At the 5-second mark, verify gold monitor flash is pulsing
3. Wait until 12-second mark, verify flash transitions to red desk escalation
4. Observe the pulse continuing
5. Check that `escalatedAt` timestamp is set in state.json at the 10-second mark

**Expected Result**:
- ✓ Flash transitions from gold to red at correct times
- ✓ Pulse animation is smooth and continuous
- ✓ No flicker or animation hiccups

---

### Test Scenario 3: Approve Button

**Objective**: Verify that clicking Approve sends correct response and resumes pipeline.

**Steps**:

1. With an approval pending, click the flashing desk
2. Verify `ApprovalMemo` popup appears with:
   - Memo header "INTERNAL DEPARTMENT MEMORANDUM"
   - TO: "Department Lead"
   - FROM: Agent name and icon
   - DATE: timestamp
   - CONTEXT: Summary of what was done
   - APPROVAL NEEDED: The approval question
3. Click the green "✓ Approve" button
4. Monitor network tab for APPROVAL_RESPONSE message:
   ```json
   {
     "type": "APPROVAL_RESPONSE",
     "department": "test-dept",
     "agentId": "researcher",
     "step": "research",
     "action": "approve",
     "respondedAt": "2026-03-28T..."
   }
   ```
5. Verify popup closes
6. Verify pipeline continues to next step
7. Check state.json shows agent status is no longer "waiting_approval"

**Expected Result**:
- ✓ Popup displays correctly formatted memo
- ✓ APPROVAL_RESPONSE is sent to backend
- ✓ Popup closes after approval
- ✓ Pipeline progresses to next step
- ✓ Agent flash animation stops

---

### Test Scenario 4: Revise Button

**Objective**: Verify that Revise with instruction re-executes the step.

**Steps**:

1. With an approval pending, click the flashing desk
2. Click in the "Revise: ..." input field
3. Type a revision instruction: "Make it more concise"
4. Click the yellow "→ Revise" button (or press Enter)
5. Monitor network tab for APPROVAL_RESPONSE:
   ```json
   {
     "type": "APPROVAL_RESPONSE",
     "department": "test-dept",
     "agentId": "researcher",
     "step": "research",
     "action": "revise",
     "instruction": "Make it more concise",
     "respondedAt": "2026-03-28T..."
   }
   ```
6. Verify popup closes
7. Verify pipeline runner re-executes the step with the instruction injected
8. Wait for new approval request or pipeline to continue

**Expected Result**:
- ✓ Revision input accepts text
- ✓ Yellow button enables only when text is entered
- ✓ APPROVAL_RESPONSE sent with correct instruction
- ✓ Pipeline re-executes the step
- ✓ Instruction is visible in agent output

---

### Test Scenario 5: Revision Input Validation

**Objective**: Verify that revision input validation works correctly.

**Steps**:

1. Open the approval memo popup
2. Verify that the "→ Revise" button is initially disabled (grayed out)
3. Click in the input field and type a space character only: " "
4. Verify the button remains disabled (spaces are trimmed)
5. Type actual text: "Add more details"
6. Verify the button becomes enabled (green/active)
7. Clear the input (Cmd/Ctrl+A, Delete)
8. Verify the button is disabled again

**Expected Result**:
- ✓ Button correctly validates non-empty trimmed input
- ✓ Button state updates reactively
- ✓ Whitespace-only input is rejected

---

### Test Scenario 6: Enter Key Support

**Objective**: Verify that pressing Enter submits revision.

**Steps**:

1. Open the approval memo popup
2. Click in the revision input field
3. Type: "Improve clarity"
4. Press Enter key
5. Verify popup closes and APPROVAL_RESPONSE is sent with action: "revise"

**Expected Result**:
- ✓ Enter key submits the revision
- ✓ Popup closes immediately
- ✓ Message is sent to backend

---

### Test Scenario 7: Popup Close Button

**Objective**: Verify that closing the popup without deciding doesn't affect the approval.

**Steps**:

1. Open the approval memo popup
2. Verify close (X) button is visible in top-right corner
3. Click the close button
4. Verify popup closes
5. Verify agent desk still shows flash animation
6. Verify approval is still pending (state.json still has approval)
7. Click desk again to re-open popup

**Expected Result**:
- ✓ Close button dismisses popup without sending response
- ✓ Approval remains pending
- ✓ Can re-open popup by clicking desk again

---

### Test Scenario 8: Non-Blocking Popup

**Objective**: Verify that popup doesn't block canvas interaction.

**Steps**:

1. Open the approval memo popup
2. While popup is open, try to pan/zoom the canvas behind it (if supported)
3. Try clicking other desks (should not be interactive while popup is open)
4. Close the popup
5. Verify normal canvas interaction resumes

**Expected Result**:
- ✓ Popup is positioned fixed and visible above canvas
- ✓ Canvas remains functional behind popup

---

### Test Scenario 9: Multiple Approvals

**Objective**: Verify handling of multiple concurrent approvals.

**Setup**:
- Create a department with multiple agents that have approval gates
- Design pipeline so multiple agents might need approval simultaneously

**Steps**:

1. Trigger approvals on multiple agents
2. Verify multiple desks show flash animations
3. Click one desk to open memo
4. Verify that is the only popup visible
5. Approve/revise the first agent
6. Verify popup closes
7. Click second desk
8. Verify second memo appears correctly

**Expected Result**:
- ✓ Multiple agents can have approvals pending
- ✓ Only one popup visible at a time
- ✓ Each popup shows correct agent/approval
- ✓ Flash animations continue on other agents' desks

---

### Test Scenario 10: Memory Logging

**Objective**: Verify that approvals are logged to department memory.

**Steps**:

1. Complete an approval flow (approve a step)
2. When pipeline completes, check `departments/{name}/_memory/memories.md`
3. Verify the "## Approvals" section contains:
   ```markdown
   ### Run {run_id} — {date}
   - Step: research
   - Agent: Research Agent 🔍
   - Question: Is the research comprehensive?
   - Decision: **approved**
   - Response Time: {seconds}
   ```
4. Verify timestamps are ISO format
5. Verify response time calculation is accurate

**Expected Result**:
- ✓ Approvals section created if missing
- ✓ All approval details logged correctly
- ✓ Response time is reasonable (±1 second)

---

## Automated Testing

For continuous integration, run unit tests:

```bash
npm test                           # All tests
node --test tests/approval.test.js # Approval tests only
```

Tests verify:
- Message structure validation
- State transitions
- Flash animation timing
- Response handling
- Memory formatting

## Browser Compatibility

Tested on:
- [ ] Chrome/Chromium 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+

## Performance Testing

Monitor during approval flows:

```javascript
// In browser console
performance.mark('approval-request');
// ... interaction ...
performance.mark('approval-close');
performance.measure('approval-flow', 'approval-request', 'approval-close');
performance.getEntriesByName('approval-flow')[0].duration; // Should be <100ms
```

## Troubleshooting Checklist

- [ ] WebSocket connection established (DevTools → Network)
- [ ] APPROVAL_REQUEST message received
- [ ] Agent status is "waiting_approval"
- [ ] Flash animation CSS is not blocked
- [ ] GPU acceleration enabled in browser
- [ ] No console errors or warnings
- [ ] state.json has approval data
- [ ] Approval timestamp is recent (within 1-2 seconds)

## Known Limitations

- Only one approval memo visible at a time
- No sound notification (visual only)
- No approval history/audit in current dashboard
- Flash animation requires GPU acceleration for smooth performance
- Multiple approvals on same agent not supported (max 1 per agent)
