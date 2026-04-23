# Notion Scripts

Scripts for interacting with Notion API.

## Files

| Script | Purpose |
|--------|---------|
| `check_notion.py` | Read and display page structure |
| `create_database.py` | Convert todos to database with properties |
| `update_progress.py` | Update progress bar based on completed todos |
| `notion_progress.sh` | Shell wrapper for `update_progress.py` |

## Usage

```bash
# Check page structure
python3 scripts/notion/check_notion.py

# Update progress bar
python3 scripts/notion/update_progress.py
# or
./scripts/notion/notion_progress.sh
```

## API Key

Stored in `/home/ivo/.openclaw/workspace/.env` as `NOTION_KEY`.