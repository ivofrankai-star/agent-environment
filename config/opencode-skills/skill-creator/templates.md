---
name: skill-creator
description: Creates Opencode skills following the standard structure. Use when the user wants to build a new skill, mentions "create a skill", "build me a skill", or references skill creator instructions.
---

# Skill Creator Templates

## Standard Output Format

When generating a skill, output in this format:

```markdown
### [Folder Name]

**Path:** `.opencode/skills/[skill-name]/`

---

### SKILL.md

```markdown
---
name: [gerund-name]
description: [3rd-person description]
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

---

### Supporting Files

[If applicable: scripts/, examples/, resources/]
```

## YAML Frontmatter Template

```yaml
---
name: [gerund-form-name]
description: [Verb] [object] for [purpose]. Use when the user mentions [trigger 1] or [trigger 2].
---
```

### Examples

| Skill Purpose | name | description |
|---------------|------|-------------|
| PDF text extraction | `extracting-pdfs` | Extracts text from PDF files. Use when the user mentions document processing, PDF files, or text extraction. |
| Database management | `managing-databases` | Manages database migrations and schemas. Use when the user mentions migrations, schema changes, or database operations. |
| Code security | `auditing-code-security` | Audits code for security vulnerabilities. Use when the user mentions security, secrets, or vulnerability scanning. |

## Freedom Level Templates

### High Freedom (Bullet Points)

Use for heuristics and flexible approaches:

```markdown
## Instructions

- Identify the target files
- Apply appropriate transformations
- Verify changes before committing
- Document any exceptions
```

### Medium Freedom (Code Blocks)

Use for templates and structured output:

```markdown
## Instructions

Run the following command:

```bash
curl -s "https://api.example.com/endpoint" | jq '.data'
```

Expected output format:

```json
{
  "status": "success",
  "data": [...]
}
```
```

### Low Freedom (Exact Commands)

Use for fragile operations:

```markdown
## Instructions

Execute exactly:

```bash
rm -rf ./node_modules && npm install
```
```

## Directory Structure Templates

### Minimal Skill

```
<skill-name>/
└── SKILL.md
```

### With Scripts

```
<skill-name>/
├── SKILL.md
└── scripts/
    └── helper.sh
```

### Full Structure

```
<skill-name>/
├── SKILL.md
├── scripts/
│   └── helper.sh
├── examples/
│   └── example-usage.md
└── resources/
    └── template.json
```
