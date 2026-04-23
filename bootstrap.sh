#!/bin/bash

AGENT_ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_DIR="${HOME:-/home/user}"

log() { echo "[bootstrap] $*"; }
warn() { echo "[bootstrap] WARNING: $*" >&2; }

write_env_from_secrets() {
    log "Writing .env from runtime environment variables..."
    ENV_FILE="$AGENT_ENV_DIR/.env"
    > "$ENV_FILE"
    for var in NVIDIA_API_KEY OPENROUTER_API_KEY TELEGRAM_BOT_TOKEN TELEGRAM_ALLOWED_USERS \
               HERMES_GATEWAY_TOKEN OPENCLAW_GATEWAY_TOKEN NOTION_API_KEY YOUTUBE_KEY \
               PAT_GITHUB SUPABASE_URL SUPABASE_ANON_KEY AGENT_COMMAND_WEBHOOK_SECRET; do
        val="${!var}"
        if [ -n "$val" ]; then
            echo "${var}=${val}" >> "$ENV_FILE"
        fi
    done
}

setup_hermes() {
    log "Setting up Hermes Agent..."
    HERMES_HOME="$HOME_DIR/.hermes"
    HERMES_AGENT_SRC="$AGENT_ENV_DIR/hermes/agent"

    mkdir -p "$HERMES_HOME"
    cp -r "$HERMES_AGENT_SRC" "$HERMES_HOME/hermes-agent"
    cp "$AGENT_ENV_DIR/config/hermes-config.yaml" "$HERMES_HOME/config.yaml" 2>/dev/null || true

    if [ -f "$AGENT_ENV_DIR/.env" ]; then
        cp "$AGENT_ENV_DIR/.env" "$HERMES_HOME/.env"
    fi

    mkdir -p "$HERMES_HOME/skills"
    cp -r "$AGENT_ENV_DIR/hermes/skills/"* "$HERMES_HOME/skills/" 2>/dev/null || true

    cd "$HERMES_HOME/hermes-agent"
    python3 -m venv venv 2>/dev/null || true
    source venv/bin/activate 2>/dev/null || true
    pip install --upgrade pip setuptools wheel 2>/dev/null || true
    pip install -e ".[all]" 2>/dev/null || pip install -e . 2>/dev/null || true
    npm install --prefer-offline --no-audit 2>/dev/null || true
    deactivate 2>/dev/null || true

    mkdir -p "$HOME_DIR/.local/bin"
    ln -sf "$HERMES_HOME/hermes-agent/venv/bin/hermes" "$HOME_DIR/.local/bin/hermes" 2>/dev/null || true
}

setup_openclaw() {
    log "Setting up OpenClaw..."
    OPENCLAW_HOME="$HOME_DIR/.openclaw"
    mkdir -p "$OPENCLAW_HOME"

    cp "$AGENT_ENV_DIR/config/openclaw-config.json" "$OPENCLAW_HOME/openclaw.json" 2>/dev/null || true
    cp -r "$AGENT_ENV_DIR/openclaw/configs/"* "$OPENCLAW_HOME/" 2>/dev/null || true

    if [ -f "$AGENT_ENV_DIR/.env" ]; then
        cp "$AGENT_ENV_DIR/.env" "$OPENCLAW_HOME/.env"
    fi

    cp -r "$AGENT_ENV_DIR/openclaw/workspace" "$OPENCLAW_HOME/workspace" 2>/dev/null || true
    mkdir -p "$OPENCLAW_HOME/completions" "$OPENCLAW_HOME/agents" "$OPENCLAW_HOME/flows" "$OPENCLAW_HOME/devices"
}

setup_notebooklm() {
    log "Setting up NotebookLM MCP..."
    mkdir -p "$HOME_DIR/.notebooklm-mcp" "$HOME_DIR/.notebooklm-mcp-cli"
    cp -r "$AGENT_ENV_DIR/notebooklm/config/mcp/"* "$HOME_DIR/.notebooklm-mcp/" 2>/dev/null || true
    cp -r "$AGENT_ENV_DIR/notebooklm/config/cli/"* "$HOME_DIR/.notebooklm-mcp-cli/" 2>/dev/null || true
}

setup_piper() {
    log "Setting up Piper TTS..."
    PIPER_DIR="$HOME_DIR/piper"
    mkdir -p "$PIPER_DIR/piper" "$PIPER_DIR/voices"
    cp "$AGENT_ENV_DIR/piper/piper_tts.sh" "$PIPER_DIR/" 2>/dev/null || true
    chmod +x "$PIPER_DIR/piper_tts.sh" 2>/dev/null || true
}

setup_dotfiles() {
    log "Setting up dotfiles..."
    cp "$AGENT_ENV_DIR/dotfiles/bashrc" "$HOME_DIR/.bashrc" 2>/dev/null || true
    cp "$AGENT_ENV_DIR/dotfiles/profile" "$HOME_DIR/.profile" 2>/dev/null || true
    cp "$AGENT_ENV_DIR/dotfiles/npmrc" "$HOME_DIR/.npmrc" 2>/dev/null || true
    cp "$AGENT_ENV_DIR/dotfiles/opencode.json" "$HOME_DIR/.opencode.json" 2>/dev/null || true
}

setup_documents() {
    log "Setting up Documents and workspace..."
    mkdir -p "$HOME_DIR/Documents" "$HOME_DIR/workspace"
    cp -r "$AGENT_ENV_DIR/documents/"* "$HOME_DIR/Documents/" 2>/dev/null || true
    cp -r "$AGENT_ENV_DIR/workspace/"* "$HOME_DIR/workspace/" 2>/dev/null || true
}

setup_opencode() {
    log "Setting up OpenCode..."
    mkdir -p "$HOME_DIR/.opencode/skills"
    cp -r "$AGENT_ENV_DIR/config/opencode-skills/"* "$HOME_DIR/.opencode/skills/" 2>/dev/null || true
}

write_env_files() {
    log "Writing .env files..."
    if [ -f "$AGENT_ENV_DIR/.env" ]; then
        for dest in "$HOME_DIR/.hermes/.env" "$HOME_DIR/.openclaw/.env"; do
            mkdir -p "$(dirname "$dest")"
            cp "$AGENT_ENV_DIR/.env" "$dest"
        done
    fi
}

main() {
    log "=== Agent Environment Bootstrap ==="
    log "Source: $AGENT_ENV_DIR"
    log "Target: $HOME_DIR"

    write_env_from_secrets
    setup_hermes
    setup_openclaw
    setup_notebooklm
    setup_piper
    setup_dotfiles
    setup_documents
    setup_opencode
    write_env_files

    log "=== Bootstrap Complete ==="
}

main "$@"
