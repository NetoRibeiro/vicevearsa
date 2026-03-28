# Content Review Studio — Demo Department

A complete example department showcasing the ViceVearsa approval system.

## What This Department Does

The Content Review Studio demonstrates a realistic workflow:

1. **Research Phase** 🔍
   - Agent researches a topic using web_search
   - Gathers multiple sources and synthesizes findings
   - Requires dashboard approval before proceeding

2. **Writing Phase** ✍️
   - Agent writes engaging content based on research
   - Transforms findings into compelling narrative
   - Requires dashboard approval before final review

3. **Final Review** 👁️
   - User makes final decision on publishing
   - Can approve, request revisions, or start over

## Quick Start

### Run the Department

```bash
npx vicevearsa run content-review
```

When prompted, provide a topic to research:
```
Example: "The future of artificial intelligence in business"
```

Or use the example topic from `input/example-topic.md`:
```
Example: "The impact of remote work on productivity"
```

### Watch the Dashboard

1. Open the dashboard (if not already running): `npm run dev` in dashboard/
2. Select "Content Review Studio" from the department list
3. See agents working at their desks
4. Watch approval requests trigger flash animations

### Test the Approval System

#### Approve Research
When research is complete:
- See desk flash with gold monitor glow (0-10 seconds)
- Click the desk to open the approval memo
- Review the research findings
- Click "✓ Approve" to continue to writing
- OR click "→ Revise" to ask for more research

#### Approve Content
When content is complete:
- See desk flash transition to red (after 10 seconds)
- Click to open approval memo
- Read the generated content
- Approve to proceed to final review
- OR revise with feedback like "Make it more concise"

#### Make Final Decision
At the checkpoint:
- Review the generated content in the chat
- Type `approve` to accept
- Type `revise: [feedback]` to request changes
- Type `restart` to start over

## Architecture

```
content-review/
├── department.yaml              # Department metadata
├── department-party.csv         # Agent roster
├── agents/
│   ├── researcher.agent.md      # Research specialist
│   └── writer.agent.md          # Content writer
├── pipeline/
│   ├── pipeline.yaml            # Pipeline definition
│   └── steps/
│       ├── research.md          # ✓ Approval gate 1
│       ├── write.md             # ✓ Approval gate 2
│       └── review.md            # Final checkpoint
├── input/
│   └── example-topic.md         # Sample topic
├── output/                      # Generated content (created after run)
├── _memory/
│   └── memories.md              # Run history & learnings
└── README.md                    # This file
```

## Approval System Features Demonstrated

### 1. Multiple Approval Gates

This department has TWO approval gates:
- **Gate 1**: After research (can revise findings)
- **Gate 2**: After writing (can revise content)

Both trigger dashboard alerts and allow approve/revise decisions.

### 2. Flash Animation Escalation

Monitor the approval flash animations:
- **0-10 seconds**: Gold monitor flash (gentle alert)
- **10-600 seconds**: Red desk escalation (more urgent)
- **600+ seconds**: System escalation (critical)

This gives you time to review but escalates if you ignore it.

### 3. Revision Workflow

You can revise at any approval gate:

**Revise research**:
```
→ Revise
Focus on recent studies about remote work productivity in 2024
```

The researcher will re-execute with your instruction injected.

**Revise content**:
```
→ Revise
Make the opening hook more compelling and add specific statistics
```

The writer will improve the content based on feedback.

### 4. Memory Logging

After the run completes, check `_memory/memories.md`:

```markdown
## Approvals

### Run 2026-03-28-120530 — 2026-03-28
- Step: research
- Agent: Research Agent 🔍
- Question: Are the research findings comprehensive and well-sourced?
- Decision: **approved**
- Response Time: 45 seconds

- Step: write
- Agent: Content Writer ✍️
- Question: Is the content engaging, clear, and well-structured?
- Decision: **revised**
- Revision Instruction: "Make the opening hook more emotional"
- Response Time: 32 seconds
```

## Customization

### Change the Topic

Edit `input/example-topic.md` or create a new file:

```markdown
# Research Topic

**Topic**: Your topic here
**Focus Areas**:
- Key area 1
- Key area 2
```

Then run: `npx vicevearsa run content-review`

### Modify Agents

Edit `agents/researcher.agent.md` or `agents/writer.agent.md`:
- Update the Operational Framework
- Change Output Format
- Add or remove anti-patterns
- Adjust Voice Guidance

Changes take effect on next run.

### Add More Approval Gates

Add a new step file in `pipeline/steps/`:

```yaml
---
step_id: edit
agent: editor
approval_needed: true
approval_question: Does this flow well?
inputFile: departments/content-review/output/content.md
outputFile: departments/content-review/output/content-edited.md
---
```

Then update `pipeline/pipeline.yaml` to include it.

## Troubleshooting

### "No agents found"
Make sure `agents/` directory has `.agent.md` files and `department-party.csv` references them correctly.

### "Approval doesn't appear"
1. Check the runner is sending `APPROVAL_REQUEST` message
2. Verify the step has `approval_needed: true` in frontmatter
3. Check browser DevTools Network tab for WebSocket messages

### "Flash animation not showing"
1. Agent status should be `"waiting_approval"`
2. Check `agent.approval.needed === true` in state.json
3. Verify approval timestamp is recent

### "Revision doesn't work"
1. Check that you have text in the revision input (non-empty)
2. Click "→ Revise" button (not just pressing Enter)
3. Monitor runner logs to see if revision instruction was received

## Performance Notes

**Typical run time**: 2-5 minutes
- Research: 30-60 seconds (web_search can be slow)
- Writing: 20-40 seconds
- Approvals: 20-60 seconds (waiting for user)
- Final review: 10-30 seconds

**Most time is spent**: Web search in research phase

## Use Cases

### Learning the Approval System
This is the best department to understand how approvals work before building your own.

### Testing New Agents
Modify the agents to test how different personas handle the workflow.

### Developing Approval Rules
Experiment with different approval gate configurations and veto conditions.

### Integration Testing
Use this to test the full approval workflow before running production departments.

## Next Steps

After understanding this department:

1. **Create your own department** with approval gates
   ```bash
   /vicevearsa create my-department
   ```

2. **Add approval gates** to your steps:
   ```yaml
   approval_needed: true
   approval_question: "Does this meet our standards?"
   ```

3. **Test with the dashboard** to see approvals in action

## Support

For issues or questions:
- Check `APPROVAL_TESTING.md` in `dashboard/` for testing procedures
- Review `dashboard/README.md` for approval system details
- Check `_vicevearsa/core/runner.pipeline.md` for technical documentation

---

**Happy reviewing!** 👁️
