#!/bin/bash

AGENT_ENV_DIR="/home/user/agent-environment"
DATA_DIR="/data"
HOME_DIR="$HOME"

# ── Write .env from HF secrets ──────────────────────────────────
ENV_FILE="$HOME_DIR/.env"
> "$ENV_FILE"
for var in NVIDIA_API_KEY OPENROUTER_API_KEY TELEGRAM_BOT_TOKEN TELEGRAM_ALLOWED_USERS \
  HERMES_GATEWAY_TOKEN OPENCLAW_GATEWAY_TOKEN NOTION_API_KEY YOUTUBE_KEY \
  PAT_GITHUB SUPABASE_URL SUPABASE_ANON_KEY AGENT_COMMAND_WEBHOOK_SECRET; do
  val="${!var}"
  if [ -n "$val" ]; then
    echo "${var}=${val}" >> "$ENV_FILE"
  fi
done

for dest in "$HOME_DIR/.hermes/.env" "$HOME_DIR/.openclaw/.env"; do
  mkdir -p "$(dirname "$dest")"
  cp "$ENV_FILE" "$dest" 2>/dev/null || true
done

export NVIDIA_API_KEY="${NVIDIA_API_KEY:-}"
export GITHUB_PERSONAL_ACCESS_TOKEN="${PAT_GITHUB:-}"

# ── Restore /data/ persistence ──────────────────────────────────
# /data/ is the HF persistent bucket — survives rebuilds.
# On first run: seed /data/ from image defaults.
# On subsequent runs: restore runtime state from /data/.

if [ -d "$DATA_DIR" ] && [ -w "$DATA_DIR" ]; then
  # Seed /data/ structure on first run
  mkdir -p "$DATA_DIR/code-server-user-data" \
           "$DATA_DIR/hermes-history" \
           "$DATA_DIR/openclaw-sessions" \
           "$DATA_DIR/bash-history" \
           "$DATA_DIR/workspace"

  # Restore code-server user data (settings, extensions, state) if previously saved
  if [ -d "$DATA_DIR/code-server-user-data/User" ]; then
    mkdir -p "$HOME_DIR/.local/share/code-server/User"
    cp -r "$DATA_DIR/code-server-user-data/User/"* "$HOME_DIR/.local/share/code-server/User/" 2>/dev/null || true
  fi

  # Restore bash history if previously saved
  if [ -f "$DATA_DIR/bash-history/.bash_history" ]; then
    cp "$DATA_DIR/bash-history/.bash_history" "$HOME_DIR/.bash_history" 2>/dev/null || true
  fi

  # Restore hermes history if previously saved
  if [ -d "$DATA_DIR/hermes-history/sessions" ]; then
    mkdir -p "$HOME_DIR/.hermes/hermes-agent/sessions"
    cp -r "$DATA_DIR/hermes-history/sessions/"* "$HOME_DIR/.hermes/hermes-agent/sessions/" 2>/dev/null || true
  fi

  # Restore openclaw sessions if previously saved
  if [ -d "$DATA_DIR/openclaw-sessions/sessions" ]; then
    OC_AGENTS="$HOME_DIR/.openclaw/agents/main/sessions"
    mkdir -p "$OC_AGENTS"
    cp -r "$DATA_DIR/openclaw-sessions/sessions/"* "$OC_AGENTS/" 2>/dev/null || true
  fi
fi

# ── Start code-server with save-on-exit trap ────────────────────
# We use a background loop to periodically save runtime state to /data/
save_runtime_state() {
  if [ ! -d "$DATA_DIR" ] || [ ! -w "$DATA_DIR" ]; then
    return
  fi
  # Save code-server user settings
  if [ -d "$HOME_DIR/.local/share/code-server/User" ]; then
    mkdir -p "$DATA_DIR/code-server-user-data/User"
    cp -r "$HOME_DIR/.local/share/code-server/User/"* "$DATA_DIR/code-server-user-data/User/" 2>/dev/null || true
  fi
  # Save bash history
  if [ -f "$HOME_DIR/.bash_history" ]; then
    mkdir -p "$DATA_DIR/bash-history"
    cp "$HOME_DIR/.bash_history" "$DATA_DIR/bash-history/.bash_history" 2>/dev/null || true
  fi
  # Save hermes history
  if [ -d "$HOME_DIR/.hermes/hermes-agent/sessions" ]; then
    mkdir -p "$DATA_DIR/hermes-history/sessions"
    cp -r "$HOME_DIR/.hermes/hermes-agent/sessions/"* "$DATA_DIR/hermes-history/sessions/" 2>/dev/null || true
  fi
  # Save openclaw sessions
  OC_SESS="$HOME_DIR/.openclaw/agents/main/sessions"
  if [ -d "$OC_SESS" ]; then
    mkdir -p "$DATA_DIR/openclaw-sessions/sessions"
    cp -r "$OC_SESS/"* "$DATA_DIR/openclaw-sessions/sessions/" 2>/dev/null || true
  fi
}

# Save state every 5 minutes in background
while true; do sleep 300; save_runtime_state; done &
SAVE_PID=$!

# Also save on exit
trap save_runtime_state EXIT

exec code-server \
  --bind-addr 0.0.0.0:7860 \
  --auth none \
  --disable-telemetry \
  --disable-update-check \
  /home/user/agent-environment
