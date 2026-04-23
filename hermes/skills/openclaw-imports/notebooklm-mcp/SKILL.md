---
name: nlm-skill
version: "0.5.12"
description: "Expert guide for the NotebookLM CLI (`nlm`) and MCP server - interfaces for Google NotebookLM. Use this skill when users want to interact with NotebookLM programmatically, including: creating/managing notebooks, adding sources (URLs, YouTube, text, Google Drive), generating content (podcasts, reports, quizzes, flashcards, mind maps, slides, infographics, videos, data tables), conducting research, chatting with sources, or automating NotebookLM workflows. Triggers on mentions of \"nlm\", \"notebooklm\", \"notebook lm\", \"podcast generation\", \"audio overview\", or any NotebookLM-related automation task."
---

# NotebookLM CLI & MCP Expert

This skill provides comprehensive guidance for using NotebookLM via both the `nlm` CLI and MCP tools.

## Personalization

**IMPORTANT:** Read [Ivcek.md](Ivcek.md) for user's goals, learning style, and preferences. Use this to:

- Select sources aligned with focus areas (OpenCode, OpenClaw, AI automation)
- Create content supporting freedom-generating systems mission
- Prioritize practical solutions over theory
- Support experimental learning style
- Avoid n8n/Make/Zapier (user moved to AI-first tools)

---

## Tool Detection (CRITICAL - Read First!)

**ALWAYS check which tools are available before proceeding:**

1. **Check for MCP tools**: Look for tools starting with `mcp__notebooklm-mcp__*` or `mcp_notebooklm_*`
2. **If BOTH MCP tools AND CLI are available**: **ASK the user** which they prefer to use before proceeding
3. **If only MCP tools are available**: Use them directly (refer to tool docstrings for parameters)
4. **If only CLI is available**: Use `nlm` CLI commands via Bash

**Decision Logic:**
```
has_mcp_tools = check_available_tools()  # Look for mcp__notebooklm-mcp__* or mcp_notebooklm_*
has_cli = check_bash_available()  # Can run nlm commands

if has_mcp_tools and has_cli:
    # ASK USER: "I can use either MCP tools or the nlm CLI. Which do you prefer?"
    user_preference = ask_user()
else if has_mcp_tools:
    # Use MCP tools directly
    mcp__notebooklm-mcp__notebook_list()
else:
    # Use CLI via Bash
    bash("nlm notebook list")
```

This skill documents BOTH approaches. Choose the appropriate one based on tool availability and **user preference**.

---

## Quick Reference

**Run `nlm --ai` to get comprehensive AI-optimized documentation** - this provides a complete view of all CLI capabilities.

```bash
nlm --help                    # List all commands
nlm <command> --help          # Help for specific command
nlm --ai                      # Full AI-optimized documentation (RECOMMENDED)
nlm --version                 # Check installed version
```

---

## Critical Rules (Read First!)

1. **Always authenticate first**: Run `nlm login` before any operations
2. **Sessions expire in ~20 minutes**: Re-run `nlm login` if commands start failing
3. **⚠️ ALWAYS ASK USER BEFORE DELETE**: Before executing ANY delete command, ask the user for explicit confirmation. Deletions are **irreversible**. Show what will be deleted and warn about permanent data loss.
4. **Prefer CLI for notebook creation**: Use `nlm notebook create "Title"` via terminal for creating notebooks - it's simpler and more reliable than MCP tools for this operation. Capture the returned ID for subsequent operations.
4. **`--confirm` is REQUIRED**: All generation and delete commands need `--confirm` or `-y` (CLI) or `confirm=True` (MCP)
5. **Research requires `--notebook-id`**: The flag is mandatory, not positional
6. **Capture IDs from output**: Create/start commands return IDs needed for subsequent operations
7. **Use aliases**: Simplify long UUIDs with `nlm alias set <name> <uuid>`
8. **Check aliases before creating**: Run `nlm alias list` before creating a new alias to avoid conflicts with existing names.
9. **DO NOT launch REPL**: Never use `nlm chat start` - it opens an interactive REPL that AI tools cannot control. Use `nlm notebook query` for one-shot Q&A instead.
10. **Choose output format wisely**: Default output (no flags) is compact and token-efficient—use it for status checks. Use `--quiet` to capture IDs for piping. Only use `--json` when you need to parse specific fields programmatically.
11. **Use `--help` when unsure**: Run `nlm <command> --help` to see available options and flags for any command.

---

## Complete MCP Tool Reference (34 Tools)

### Notebooks (6 tools)
| Tool | Description |
|------|-------------|
| `notebook_list` | List all notebooks |
| `notebook_create` | Create new notebook |
| `notebook_get` | Get notebook details with sources |
| `notebook_describe` | Get AI summary and suggested topics |
| `notebook_rename` | Rename a notebook |
| `notebook_delete` | Delete notebook (requires `confirm=True`) |

### Sources (6 tools)
| Tool | Description |
|------|-------------|
| `source_add` | **Unified** - Add URL, text, file, or Drive source |
| `source_list_drive` | List sources with Drive freshness status |
| `source_sync_drive` | Sync stale Drive sources (requires `confirm=True`) |
| `source_delete` | Delete source (requires `confirm=True`) |
| `source_describe` | Get AI summary with keywords |
| `source_get_content` | Get raw text content |

### Querying (2 tools)
| Tool | Description |
|------|-------------|
| `notebook_query` | Ask AI about sources in notebook |
| `chat_configure` | Set chat goal and response length |

### Studio Content (4 tools)
| Tool | Description |
|------|-------------|
| `studio_create` | **Unified** - Create any artifact type |
| `studio_status` | Check generation progress |
| `studio_delete` | Delete artifact (requires `confirm=True`) |
| `studio_revise` | Revise slides in a slide deck |

### Downloads (1 tool)
| Tool | Description |
|------|-------------|
| `download_artifact` | Download artifact (audio, video, report, etc.) |

### Exports (1 tool)
| Tool | Description |
|------|-------------|
| `export_artifact` | Export to Google Docs/Sheets |

### Research (3 tools)
| Tool | Description |
|------|-------------|
| `research_start` | Start research (web or Drive) |
| `research_status` | Poll research progress |
| `research_import` | Import discovered sources |

### Notes (1 unified tool)
| Tool | Description |
|------|-------------|
| `note` | Actions: `create`, `list`, `update`, `delete` (requires `confirm=True`) |

### Sharing (3 tools)
| Tool | Description |
|------|-------------|
| `notebook_share_status` | Get sharing settings |
| `notebook_share_public` | Enable/disable public link |
| `notebook_share_invite` | Invite collaborator by email |

### Auth (2 tools)
| Tool | Description |
|------|-------------|
| `refresh_auth` | Reload auth tokens |
| `save_auth_tokens` | Manually save cookies (fallback) |

### Server (1 tool)
| Tool | Description |
|------|-------------|
| `server_info` | Get version and check updates |

### Batch & Cross-Notebook (2 tools)
| Tool | Description |
|------|-------------|
| `batch` | Multi-notebook operations |
| `cross_notebook_query` | Query across notebooks |

### Pipelines (1 tool)
| Tool | Description |
|------|-------------|
| `pipeline` | Execute multi-step workflows |

### Tags (1 tool)
| Tool | Description |
|------|-------------|
| `tag` | Actions: `add`, `remove`, `list`, `select` |

---

## source_add Parameters

```python
source_add(
    notebook_id="...",
    source_type="url",     # url | text | file | drive
    url="https://...",     # for source_type=url
    text="...",            # for source_type=text
    title="...",           # optional title
    file_path="/path/to.pdf",  # for source_type=file
    document_id="...",     # for source_type=drive
    doc_type="doc",        # doc | slides | sheets | pdf
    wait=True,             # wait for processing to complete
    wait_timeout=120.0     # seconds to wait
)
```

---

## studio_create Parameters

```python
studio_create(
    notebook_id="...",
    artifact_type="audio",  # audio | video | report | quiz | flashcards | mind_map | slide_deck | infographic | data_table
    confirm=True,           # REQUIRED
    
    # Audio options
    audio_format="deep_dive",  # deep_dive | brief | critique | debate
    audio_length="default",    # short | default | long
    
    # Video options
    video_format="explainer",  # explainer | brief | cinematic
    visual_style="auto_select",  # auto_select | classic | whiteboard | kawaii | anime | watercolor | retro_print | heritage | paper_craft
    
    # Report options
    report_format="Briefing Doc",  # Briefing Doc | Study Guide | Blog Post | Create Your Own
    custom_prompt="...",           # for Create Your Own
    
    # Quiz/Flashcards options
    question_count=5,       # number of questions
    difficulty="medium",    # easy | medium | hard
    
    # Slide deck options
    slide_format="detailed_deck",  # detailed_deck | presenter_slides
    slide_length="default",        # short | default
    
    # Infographic options
    orientation="landscape",       # landscape | portrait | square
    detail_level="standard",       # concise | standard | detailed
    infographic_style="auto_select",  # auto_select | sketch_note | professional | bento_grid | editorial | instructional | bricks | clay | anime | kawaii | scientific
    
    # Data table options
    description="...",       # REQUIRED for data_table
    
    # Common options
    source_ids=["id1", "id2"],  # limit to specific sources
    language="en",              # BCP-47 code
    focus_prompt="..."          # focus text
)
```

---

## CLI Command Reference

### Authentication
```bash
nlm login                              # Authenticate (opens browser)
nlm login --profile work               # Named profile
nlm login --check                      # Check if auth valid
nlm auth status                        # Check current auth
nlm auth list                          # List all profiles
```

### Notebooks
```bash
nlm notebook list                      # List all notebooks
nlm notebook create "Title"            # Create new notebook
nlm notebook get <id>                  # Get notebook details
nlm notebook describe <id>             # AI summary with topics
nlm notebook rename <id> "New Title"   # Rename notebook
nlm notebook delete <id> --confirm     # Delete permanently
nlm notebook query <id> "question"     # Chat with sources
```

### Sources
```bash
nlm source add <nb-id> --url "https://..."              # Web page
nlm source add <nb-id> --url "https://youtube.com/..."  # YouTube
nlm source add <nb-id> --text "content" --title "X"    # Pasted text
nlm source add <nb-id> --drive <doc-id>                # Drive doc
nlm source add <nb-id> --drive <doc-id> --type slides  # Explicit type
nlm source list <nb-id>                # Table of sources
nlm source describe <source-id>        # AI summary + keywords
nlm source content <source-id>         # Raw text content
nlm source sync <nb-id> --confirm      # Sync stale Drive sources
nlm source delete <source-id> --confirm
```

### Research
```bash
nlm research start "query" --notebook-id <id>              # Fast web (~30s)
nlm research start "query" --notebook-id <id> --mode deep  # Deep web (~5min)
nlm research start "query" --notebook-id <id> --source drive  # Drive search
nlm research status <nb-id>            # Poll until done
nlm research import <nb-id> <task-id>  # Import discovered sources
```

### Studio (Content Generation)
```bash
# Audio
nlm audio create <id> --confirm
nlm audio create <id> --format deep_dive --length default --confirm

# Video
nlm video create <id> --confirm
nlm video create <id> --format explainer --style whiteboard --confirm

# Report
nlm report create <id> --confirm
nlm report create <id> --format "Study Guide" --confirm

# Quiz
nlm quiz create <id> --confirm
nlm quiz create <id> --count 5 --difficulty 3 --confirm

# Flashcards
nlm flashcards create <id> --confirm

# Mind Map
nlm mindmap create <id> --confirm

# Slides
nlm slides create <id> --confirm
nlm slides revise <artifact-id> --instructions "..." --confirm

# Infographic
nlm infographic create <id> --confirm
nlm infographic create <id> --orientation landscape --style professional --confirm

# Data Table
nlm data-table create <id> "description" --confirm

# Status
nlm studio status <id>
```

### Download & Export
```bash
nlm download audio <nb-id> <artifact-id> -o podcast.mp3
nlm download video <nb-id> <artifact-id> -o video.mp4
nlm download slides <nb-id> <artifact-id> -o slides.pdf
nlm download infographic <nb-id> <artifact-id> -o image.png
nlm export report <nb-id> <artifact-id>  # To Google Docs
nlm export data-table <nb-id> <artifact-id>  # To Google Sheets
```

### Sharing
```bash
nlm share status <id>
nlm share public <id>
nlm share private <id>
nlm share invite <id> --email user@example.com --role viewer
```

### Batch Operations
```bash
nlm batch query "question" --notebooks "nb1,nb2"
nlm batch add-source --url "https://..." --tags "ai,ml"
nlm batch create --titles "Project A,Project B"
nlm batch delete --notebooks "old1,old2" --confirm
```

### Cross-Notebook Query
```bash
nlm cross query "question" --notebooks "nb1,nb2"
nlm cross query "question" --tags "ai,ml"
nlm cross query "question" --all
```

### Tags
```bash
nlm tag add <id> --tags "ai,ml,research"
nlm tag remove <id> --tags "ml"
nlm tag list
nlm tag select "ai mcp"
```

### Pipelines
```bash
nlm pipeline list
nlm pipeline run ingest-and-podcast --notebook-id <id> --url "https://..."
nlm pipeline run research-and-report --notebook-id <id> --query "topic"
```

### Aliases
```bash
nlm alias set myproject <uuid>
nlm alias list
nlm alias get myproject
nlm alias delete myproject
```

---

## Workflow Examples

### Research → Podcast Pipeline
```bash
nb=$(nlm notebook create "AI Research" --quiet)
nlm research start "AI agents 2024" --notebook-id $nb
nlm research status $nb
nlm research import $nb <task-id>
nlm audio create $nb --confirm
```

### Add Sources with Wait
```bash
nb=$(nlm notebook create "My Notebook" --quiet)
nlm source add $nb --url "https://example.com" --wait
nlm source add $nb --text "My notes" --title "Notes" --wait
nlm notebook query $nb "What are the key points?"
```

### Generate Study Materials
```bash
nlm quiz create $nb --count 10 --difficulty 3 --confirm
nlm flashcards create $nb --confirm
nlm report create $nb --format "Study Guide" --confirm
```

### Tag, Batch & Cross-Notebook
```bash
nlm tag add $nb --tags "ai,research"
nlm batch add-source --url "https://..." --tags "research"
nlm cross query "key findings" --tags "ai"
```

---

## Resources

- **[Ivcek.md](Ivcek.md)** - User profile for personalized content (READ THIS FIRST)
- **Official Repo**: https://github.com/jacob-bd/notebooklm-mcp-cli
- **CLI Guide**: `nlm --ai` for comprehensive documentation
