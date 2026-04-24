#!/bin/bash

AGENT_ENV_DIR="/home/user/agent-environment"
ENV_FILE="$HOME/.env"

> "$ENV_FILE"
for var in NVIDIA_API_KEY OPENROUTER_API_KEY TELEGRAM_BOT_TOKEN TELEGRAM_ALLOWED_USERS \
  HERMES_GATEWAY_TOKEN OPENCLAW_GATEWAY_TOKEN NOTION_API_KEY YOUTUBE_KEY \
  PAT_GITHUB SUPABASE_URL SUPABASE_ANON_KEY AGENT_COMMAND_WEBHOOK_SECRET; do
  val="${!var}"
  if [ -n "$val" ]; then
    echo "${var}=${val}" >> "$ENV_FILE"
  fi
done

for dest in "$HOME/.hermes/.env" "$HOME/.openclaw/.env"; do
  mkdir -p "$(dirname "$dest")"
  cp "$ENV_FILE" "$dest" 2>/dev/null || true
done

export NVIDIA_API_KEY="${NVIDIA_API_KEY:-}"
export GITHUB_PERSONAL_ACCESS_TOKEN="${PAT_GITHUB:-}"

exec code-server \
  --bind-addr 0.0.0.0:7860 \
  --auth none \
  --disable-telemetry \
  --disable-update-check \
  /home/user/agent-environment
