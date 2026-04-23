# Wiki Schema

## Domain
Personal knowledge base covering AI/ML research, software development, productivity systems, and general knowledge management.

## Conventions
- File names: lowercase, hyphens, no spaces (e.g., `transformer-architecture.md`)
- Every wiki page starts with YAML frontmatter (see below)
- Use `[[wikilinks]]` to link between pages
- When updating a page, always bump the `updated` date
- Every new page must be added to `index.md` under the correct section
- Every action must be appended to `log.md`

## Frontmatter
```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: note | daily | reference
tags: [from taxonomy below]
---
```

## Tag Taxonomy

### AI/ML
- ai/llm - Large language models
- ai/agents - AI agents and tool use
- ai/training - Training methodologies
- ai/evaluation - Model evaluation
- ai/safety - AI safety and alignment

### Development
- dev/python - Python development
- dev/javascript - JavaScript/TypeScript
- dev/systems - Systems programming
- dev/tools - Development tools
- dev/patterns - Software patterns

### Research
- research/papers - Academic papers
- research/arxiv - arXiv papers
- research/ideas - Research ideas

### Knowledge Management
- km/methodology - Knowledge management methods
- km/tools - KM tools (Obsidian, etc.)
- km/workflows - KM workflows

### Productivity
- prod/systems - Productivity systems
- prod/habits - Habits and routines
- prod/reviews - Periodic reviews

### Meta
- meta/index - Index pages
- meta/template - Templates

## File Organization

### Notes (`notes/`)
All notes and knowledge entries.

### System (`_system/`)
Templates, raw sources, and system files (concepts, comparisons, queries, raw sources).

## Hermes Integration
This vault is linked to Hermes Agent via `OBSIDIAN_VAULT_PATH` environment variable.

### Commands
- Read: `cat "$VAULT/notes/Note Name.md"`
- List: `find "$VAULT/notes" -name "*.md" -type f`
- Search: `grep -rli "keyword" "$VAULT" --include="*.md"`
- Create: Use heredoc with `cat > "$VAULT/notes/New Note.md"`
- Append: Use `echo "content" >> "$VAULT/notes/Existing Note.md"`
