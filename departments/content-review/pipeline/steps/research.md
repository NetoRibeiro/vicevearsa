---
step_id: research
agent: researcher
execution: subagent
model_tier: powerful
approval_needed: true
approval_question: Are the research findings comprehensive and well-sourced?
inputFile: departments/content-review/input/topic.md
outputFile: departments/content-review/output/research.md
---

# Research Step

Research the topic provided in the input file.

## Input

The file `{inputFile}` contains:
- Topic to research
- Any specific angles or aspects to focus on
- Preferred source types (news, academic, industry)

## Task

1. **Analyze the topic** — Understand what needs to be researched
2. **Search comprehensively** — Use web_search to find at least 5 sources
3. **Synthesize findings** — Organize by theme and identify key insights
4. **Document sources** — Clearly cite each source
5. **Recommend angles** — Suggest the best angles for the writer

## Output

Write your findings to `{outputFile}` in this format:

```markdown
# Research: {Topic}

## Key Findings
- [Finding with source]
- [Finding with source]
- ...

## Context & Background
[Narrative about why these findings matter]

## Recommended Angles
- [Angle 1: Why this works]
- [Angle 2: Why this works]
```

## Quality Standards

✓ Minimum 5 sources from diverse domains
✓ Each finding has clear source attribution
✓ Findings are recent (prefer sources from last 6 months)
✓ Synthesis explains connections between findings
✓ At least 2 recommended angles with rationale

## Veto Conditions

This research will be rejected if:
- Fewer than 5 sources cited
- Sources are undocumented or unclear
- Findings are generic or obvious
- Contains speculation presented as fact
