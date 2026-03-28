---
step_id: write
agent: writer
execution: inline
model_tier: powerful
approval_needed: true
approval_question: Is the content engaging, clear, and well-structured?
inputFile: departments/content-review/output/research.md
outputFile: departments/content-review/output/content.md
---

# Write Step

Transform the research into engaging content.

## Input

The file `{inputFile}` contains:
- Research findings
- Recommended angles
- Source references

## Task

1. **Select an angle** — Choose the most compelling approach from recommendations
2. **Hook the reader** — Start with something that makes them care
3. **Structure logically** — Organize main points in clear sections
4. **Use examples** — Make abstract concepts concrete
5. **Add a call-to-action** — Tell reader what to do next
6. **Edit ruthlessly** — Remove anything that doesn't earn its space

## Output

Write your content to `{outputFile}`:

```markdown
# {Compelling Title}

**Opening Hook**: Why the reader should care

## Main Point 1
[Explanation with examples]

## Main Point 2
[Explanation with examples]

## Key Takeaway
[Single memorable insight]

**Next Steps**: What reader should do now
```

## Quality Standards

✓ Title is specific and compelling
✓ Opening hook creates immediate interest
✓ Content flows logically from one point to next
✓ Examples illustrate key points
✓ Language is accessible to general audience
✓ Clear call-to-action at end
✓ 300-400 words

## Veto Conditions

This content will be rejected if:
- Title is generic (avoid "5 Tips to..." or "A Guide to...")
- Buries the main point after 2+ paragraphs
- Uses jargon without explanation
- No call-to-action or unclear CTA
- Contains factual errors
