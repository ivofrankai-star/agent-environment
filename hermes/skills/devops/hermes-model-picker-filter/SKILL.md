---
name: hermes-model-picker-filter
description: Customize which providers and models appear in the Hermes /model picker (Telegram, Discord). Filter by provider allowlist and free-only models.
version: 1.1.0
author: bbymama
metadata:
  hermes:
    tags: [hermes, telegram, model-picker, config]
---

# Hermes Model Picker Customization

## Problem

The `/model` command on Telegram/Discord shows every provider that has credentials — including duplicate custom providers, copilot, nvidia-nim, etc. This clutters the picker with irrelevant options.

## Solution

Add a `model_picker:` config section to the user config file that filters the provider list shown in the picker.

### Config Format (in user config YAML)

```yaml
model_picker:
  # Only show these providers in /model picker (Telegram, Discord, etc.)
  # Empty list or missing = show all authenticated providers (default behavior)
  providers: [nvidia, ollama-cloud, openrouter]
  # For openrouter: only show free models (tagged :free or marked free in catalog)
  openrouter_free_only: true
```

### Code Patch Location

File: `hermes_cli/model_switch.py`

Function: `list_authenticated_providers()` (ends around line 1122)

The patch adds a "Step 5" block after the custom providers section (Step 4) and before the final sort. It:
1. Loads `model_picker` config from `load_config()`
2. Filters `results` list to only providers in the `providers` allowlist (case-insensitive, strips `custom:` prefix for matching)
3. If `openrouter_free_only: true`, replaces OpenRouter's model list with only free-tagged models from `OPENROUTER_MODELS`

### Key Files

| File | Purpose |
|------|---------|
| User config YAML | Add `model_picker:` section here |
| `hermes_cli/model_switch.py` | `list_authenticated_providers()` — builds the picker provider list |
| `hermes_cli/models.py` | `OPENROUTER_MODELS` and `_PROVIDER_MODELS` — curated model lists per provider |
| `gateway/platforms/telegram.py` | `send_model_picker()` — renders the Telegram inline keyboard |
| `gateway/run.py` | Calls `list_authenticated_providers()` with `max_models=50` for picker |

### How the Picker Works

1. User sends `/model` on Telegram
2. Gateway calls `list_authenticated_providers(max_models=50)`
3. That function auto-discovers all providers with credentials (env vars, auth store, credential pool)
4. Returns list of dicts with slug, name, models, total_models
5. Telegram adapter renders provider buttons (2 per row)
6. User taps provider -> shows model buttons (8 per page, paginated)
7. User taps model -> callback runs `switch_model()`

### Adding More Providers

Edit `model_picker.providers` in user config. Valid slugs match the `--provider` flag names:

- `nvidia`, `ollama-cloud`, `openrouter`, `nous`, `copilot`, `anthropic`
- `zai`, `kimi-coding`, `minimax`, `deepseek`, `gemini`, `xai`
- Custom provider slugs (from `custom_providers:` config entries)

### Pitfalls

- **Source code patch**: The filter code is in model_switch.py which is part of the hermes-agent package. A package upgrade may overwrite the patch. Re-apply after upgrades.
- **Config survives upgrades**: The `model_picker:` section uses `_deep_merge()` so unknown keys are preserved even if not in DEFAULT_CONFIG.
- **Ollama Cloud models are all free**: No filtering needed for ollama-cloud.
- **NVIDIA NIM models are all free**: Same — no cost filtering needed.
- **OpenRouter free detection**: Uses the `tag` field in `OPENROUTER_MODELS` list (`"free"` tag) or `:free` suffix in model ID.
- **Static free model list gets stale**: `OPENROUTER_MODELS` in `hermes_cli/models.py` is a hardcoded fallback list. New free models on OpenRouter won't appear until this list is updated. Periodically refresh it from the OpenRouter models API, filtering for models where `pricing.prompt == "0"`.
- **Skills leak into Telegram menu**: Any installed skill with a slash command auto-registers in the Telegram `/` command menu. Disable irrelevant skills per-platform using `save_disabled_skills()` from `hermes_cli.skills_config` or the interactive `hermes skills config` command.
- **Telegram caches bot commands**: After any config, skill, or model-list change, you MUST force-refresh the Telegram command menu. Call `telegram_menu_commands()` from `hermes_cli.commands`, then push the result to `bot.set_my_commands()` via the Telegram Bot API. Otherwise stale or ghost commands persist.

### Refreshing the Free Model List

1. Query the OpenRouter models API endpoint (authenticate with your OpenRouter API key)
2. Filter the response for models where `pricing.prompt == "0"` (or models with `:free` in the ID)
3. Update `OPENROUTER_MODELS` in `hermes_cli/models.py` — list free models first with `"free"` tag, then paid models
4. Restart the gateway for changes to take effect in the picker
