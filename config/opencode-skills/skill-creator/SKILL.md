---
name: skill-creator
description: Creates Opencode skills following the standard structure. Use when the user wants to build a new skill, mentions "create a skill", "build me a skill", or references skill creator instructions.
---

# Skill Creator

## When to Use

- User says "create a skill for X"
- User mentions "build me a skill"
- User references skill creator instructions
- User wants to add new capabilities to Opencode

## Workflow

### Progress Checklist

Copy and update this checklist during skill creation:

```markdown
- [ ] Gather requirements from user
- [ ] Determine skill name (gerund form, lowercase, max 64 chars)
- [ ] Write YAML frontmatter (name, description)
- [ ] Create SKILL.md body (under 500 lines)
- [ ] Create supporting files if needed (scripts/, examples/, resources/)
- [ ] Validate against criteria
- [ ] Write files to `.opencode/skills/<skill-name>/`
```

## YAML Frontmatter Standards

```yaml
---
name: [gerund-name]
description: [3rd-person description with triggers]
---
```

### Rules

| Field | Rules |
|-------|-------|
| **name** | Gerund form (e.g., `testing-code`, `managing-databases`). Lowercase, numbers, hyphens only. Max 64 chars. No "claude", "anthropic", or "opencode". |
| **description** | Third person. Include specific triggers/keywords. Max 1024 chars. |

## Writing Principles

### 1. Conciseness

Assume the agent is smart. Do not explain basic concepts. Focus only on unique logic.

### 2. Progressive Disclosure

Keep `SKILL.md` under 500 lines. Link to secondary files if needed:

```markdown
See [ADVANCED.md](ADVANCED.md) for detailed examples.
```

Only one level deep—no nested references.

### 3. Forward Slashes

Always use `/` for paths, never `\`.

### 4. Degrees of Freedom

Match format to task constraint level:

| Freedom Level | Format | Use When |
|---------------|--------|----------|
| **High** | Bullet points | Heuristics, multiple valid approaches |
| **Medium** | Code blocks | Templates, structured output |
| **Low** | Exact bash commands | Fragile operations, specific tooling |

## Output Template

When generating a skill, use this structure:

```markdown
---
name: [gerund-name]
description: [3rd-person description with triggers]
---

# [Skill Title]

## When to Use

- [Trigger 1]
- [Trigger 2]

## Workflow

[Checklist or step-by-step guide]

## Instructions

[Specific logic, code snippets, or rules]

## Resources

- [Link to scripts/ or resources/]
```

## Supporting Files Structure

```
<skill-name>/
├── SKILL.md          # Required: Main logic
├── scripts/          # Optional: Helper scripts
├── examples/         # Optional: Reference implementations
└── resources/        # Optional: Templates or assets
```

## Validation Checklist

Before writing files, verify:

- [ ] `name` is gerund form, lowercase, max 64 chars
- [ ] `name` contains no restricted words (claude, anthropic, opencode)
- [ ] `description` is third person, max 1024 chars
- [ ] `description` includes trigger keywords
- [ ] SKILL.md is under 500 lines
- [ ] All paths use forward slashes
- [ ] Format matches freedom level (bullets/code/bash)
- [ ] Files written to `.opencode/skills/<skill-name>/`

## Error Handling

If a script is provided but usage is uncertain:

```bash
script-name --help
```

Treat scripts as black boxes—check help before executing.
