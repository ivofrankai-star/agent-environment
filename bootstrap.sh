#!/bin/bash

AGENT_ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_DIR="${HOME:-/home/user}"

log() { echo "[bootstrap] $*"; }

setup_hermes() {
  log "Setting up Hermes config..."
  HERMES_HOME="$HOME_DIR/.hermes"
  HERMES_AGENT_SRC="$AGENT_ENV_DIR/hermes/agent"

  mkdir -p "$HERMES_HOME" "$HERMES_HOME/skills"

  cp "$AGENT_ENV_DIR/config/hermes-config.yaml" "$HERMES_HOME/config.yaml"
  cp -r "$AGENT_ENV_DIR/hermes/skills/"* "$HERMES_HOME/skills/" 2>/dev/null || true

  ln -sf "$HERMES_AGENT_SRC" "$HERMES_HOME/hermes-agent" 2>/dev/null || true
  ln -sf "$HOME_DIR/.local/venv/bin/hermes" "$HOME_DIR/.local/bin/hermes" 2>/dev/null || true
}

setup_openclaw() {
  log "Setting up OpenClaw..."
  OPENCLAW_HOME="$HOME_DIR/.openclaw"
  mkdir -p "$OPENCLAW_HOME"

  cp -r "$AGENT_ENV_DIR/openclaw/configs/"* "$OPENCLAW_HOME/" 2>/dev/null || true
  cp -r "$AGENT_ENV_DIR/openclaw/workspace" "$OPENCLAW_HOME/workspace" 2>/dev/null || true
  mkdir -p "$OPENCLAW_HOME/completions" "$OPENCLAW_HOME/agents" "$OPENCLAW_HOME/flows" "$OPENCLAW_HOME/devices"
}

setup_notebooklm() {
  log "Setting up NotebookLM..."
  mkdir -p "$HOME_DIR/.notebooklm-mcp-cli"
  cp -r "$AGENT_ENV_DIR/notebooklm/config/cli/"* "$HOME_DIR/.notebooklm-mcp-cli/" 2>/dev/null || true
}

setup_piper() {
  log "Setting up Piper TTS..."
  PIPER_DIR="$HOME_DIR/piper"
  mkdir -p "$PIPER_DIR/voices"
  cp "$AGENT_ENV_DIR/piper/piper_tts.sh" "$PIPER_DIR/"
  chmod +x "$PIPER_DIR/piper_tts.sh"
  cp "$AGENT_ENV_DIR/piper/voices/"* "$PIPER_DIR/voices/" 2>/dev/null || true
}

setup_dotfiles() {
  log "Setting up dotfiles..."
  cp "$AGENT_ENV_DIR/dotfiles/bashrc" "$HOME_DIR/.bashrc"
  cp "$AGENT_ENV_DIR/dotfiles/profile" "$HOME_DIR/.profile"
  cp "$AGENT_ENV_DIR/dotfiles/npmrc" "$HOME_DIR/.npmrc"
  cp "$AGENT_ENV_DIR/dotfiles/opencode.json" "$HOME_DIR/.opencode.json"
}

setup_documents() {
  log "Setting up Documents..."
  mkdir -p "$HOME_DIR/Documents" "$HOME_DIR/workspace"
  cp -r "$AGENT_ENV_DIR/documents/"* "$HOME_DIR/Documents/" 2>/dev/null || true
  cp -r "$AGENT_ENV_DIR/workspace/"* "$HOME_DIR/workspace/" 2>/dev/null || true
}

setup_opencode() {
  log "Setting up OpenCode config..."
  mkdir -p "$HOME_DIR/.opencode/skills"
  cp -r "$AGENT_ENV_DIR/config/opencode-skills/"* "$HOME_DIR/.opencode/skills/" 2>/dev/null || true
}

main() {
  log "=== Agent Environment Bootstrap (build-time) ==="
  log "Source: $AGENT_ENV_DIR"
  log "Target: $HOME_DIR"

  setup_hermes
  setup_openclaw
  setup_notebooklm
  setup_piper
  setup_dotfiles
  setup_documents
  setup_opencode

  log "=== Bootstrap Complete ==="
}

main "$@"
