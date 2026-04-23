---
title: Agent Environment
emoji: "\U0001F4BB"
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Agent Environment

Full reproducible environment for Hermes Agent, OpenClaw, NotebookLM MCP, Piper TTS, and supporting tools. Deploys to Hugging Face Spaces (Docker) or any Ubuntu 24.04 host.

## Quick Start (Local)

```bash
cp .env.example .env # Fill in your API keys
./bootstrap.sh
```

## Deploy to Hugging Face Spaces

1. Create a new Docker Space on [huggingface.co/spaces](https://huggingface.co/spaces)
2. Push this repo to the Space's git remote
3. Add Secrets in Space settings (see .env.example for all keys)
4. The Space builds from the Dockerfile and serves code-server (VS Code in browser) on port 7860

## What's Included

| Component | Directory | Purpose |
|---|---|---|
| Hermes Agent | `hermes/agent/` | AI agent with tool-calling, skills, messaging |
| Hermes Config | `config/hermes-config.yaml` | Model, provider, gateway config |
| Hermes Skills | `hermes/skills/` | Skill definitions (mlops, research, etc.) |
| OpenClaw | `openclaw/` | Workspace, configs, agents, flows |
| NotebookLM MCP | `notebooklm/` | Config for NotebookLM CLI and MCP server |
| Piper TTS | `piper/` | Text-to-speech script + voice model download |
| Dotfiles | `dotfiles/` | bashrc, profile, npmrc, opencode.json |
| Documents | `documents/` | Obsidian vault, notes |
| Bootstrap | `bootstrap.sh` | One-shot setup: deps + configs + services |
| code-server | `config/code-server.yaml` | VS Code in browser with integrated terminal |
| Entrypoint | `entrypoint.sh` | Runs bootstrap then starts code-server |
| Deps Lists | `requirements/` | pip, apt, npm frozen lists |

## Secrets (set in HF Spaces or .env)

| Variable | Description |
|---|---|
| `PASSWORD` | code-server login password |
| `NVIDIA_API_KEY` | NVIDIA NIM API key (LLM provider) |
| `OPENROUTER_API_KEY` | OpenRouter API key (alt LLM provider) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `HERMES_GATEWAY_TOKEN` | Hermes gateway auth token |
| `OPENCLAW_GATEWAY_TOKEN` | OpenClaw gateway auth token |
| `NOTION_API_KEY` | Notion integration key |
| `YOUTUBE_KEY` | YouTube Data API key |
| `PAT_GITHUB` | GitHub PAT |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
