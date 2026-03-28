# Department Memories — Content Review Studio

**Department**: Content Review Studio 👁️
**Created**: 2026-03-28
**Purpose**: Demonstrate approval system workflow with research → write → review pipeline

## Executions Log

*(This file is updated after each pipeline run with key learnings)*

---

## Key Learnings

- Research phase typically needs 3-5 sources minimum for comprehensive coverage
- Writer prefers angles that have emotional hooks (not just analytical)
- Approval gates help catch unclear writing early before user review

---

## Performance Notes

### Research Quality Patterns
- Web_search effectiveness varies by topic specificity
- Broad topics (e.g., "remote work") benefit from narrowed angle before research
- Academic sources take slightly longer to process but add credibility

### Writing Quality Patterns
- Content that opens with a story or example gets better engagement
- Exactly 3 main sections feels optimal (not 2, not 4+)
- Specific numbers/data points > vague claims

---

## Approvals

*(Will be populated after first run with approval decisions and response times)*

---

## Recurring Issues

*(None yet — will track patterns as runs accumulate)*

---

## Setup Notes

### How to Test This Department

1. **Run the department**:
   ```bash
   /vicevearsa run content-review
   ```

2. **When prompted**, provide the topic to research (or use the example: "Remote work productivity")

3. **Monitor the flow**:
   - Research agent gathers sources
   - **Approval gate 1**: Dashboard shows approval request for research quality
   - Click desk to approve/revise research
   - Writer creates content from research
   - **Approval gate 2**: Dashboard approval for content quality
   - Final checkpoint for user to publish or request changes

4. **Watch the dashboard**:
   - See agents working at desks
   - See approval requests trigger flash animations
   - Click to open memo and approve/revise
   - See agents respond to revisions

### Approval System Demo Features

This department showcases:
- **Two approval gates** (research + writing phase)
- **Different execution modes** (research: subagent, write: inline)
- **Flash animation escalation** (monitor flash → desk escalation over time)
- **Revision workflow** (can revise research or content)
- **Final checkpoint** (user approval before publishing)

### Tips for Testing

- Set up browser DevTools → Network tab to see WebSocket messages
- Monitor state.json to see agent status changes
- Check _memory/memories.md after run for approval logging
- Try different revisions to see how agents respond to feedback
