#!/bin/bash

AGENT_ENV_DIR="/home/user/agent-environment"
DATA_DIR="/data"
HOME_DIR="$HOME"
BUILD_VERSION_FILE="$AGENT_ENV_DIR/.build-version"

# Generate a build version from the Dockerfile hash + hermes source hash
# This lets us detect when the image has been rebuilt and re-sync to /data/
calc_build_version() {
    { md5sum "$AGENT_ENV_DIR/Dockerfile" 2>/dev/null || echo "no-dockerfile"; \
      md5sum "$AGENT_ENV_DIR/requirements/pip-requirements.txt" 2>/dev/null || echo "no-reqs"; \
      md5sum "$AGENT_ENV_DIR/hermes/agent/pyproject.toml" 2>/dev/null || echo "no-pyproject"; \
    } | md5sum | cut -d' ' -f1
}

BUILD_VERSION=$(calc_build_version)

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

# ── /data/ persistence: install-once, survive-rebuilds ──────────
# Strategy: On first boot (or after image rebuild), copy the build-time
# venv/hermes-source/npm-global/piper into /data/. On every boot,
# activate /data/ versions so `hermes update`, `pip install`, `npm install -g`
# all write to /data/ and survive rebuilds.
#
# If the image is rebuilt with new base packages, we detect that via
# BUILD_VERSION and re-sync the venv + source while preserving user
# modifications in /data/ (via upgrade-in-place, not wipe-and-replace).

if [ -d "$DATA_DIR" ] && [ -w "$DATA_DIR" ]; then
    DATA_VENV="$DATA_DIR/venv"
    DATA_HERMES="$DATA_DIR/hermes-source"
    DATA_NPM="$DATA_DIR/npm-global"
    DATA_PIPER="$DATA_DIR/piper"
    DATA_SENTINEL="$DATA_DIR/.build-version"

    mkdir -p "$DATA_DIR/code-server-user-data" \
        "$DATA_DIR/hermes-history" \
        "$DATA_DIR/openclaw-sessions" \
        "$DATA_DIR/bash-history" \
        "$DATA_DIR/workspace"

    # ── First boot or image rebuild: sync build-time installs to /data/ ──
    PREV_BUILD_VERSION=""
    if [ -f "$DATA_SENTINEL" ]; then
        PREV_BUILD_VERSION=$(cat "$DATA_SENTINEL")
    fi

    if [ "$BUILD_VERSION" != "$PREV_BUILD_VERSION" ]; then
        echo "[entrypoint] Image rebuilt (build $PREV_BUILD_VERSION -> $BUILD_VERSION). Syncing to /data/..."

        # Copy/upgrade the Python venv into /data/
        # First boot: full copy. Rebuild: recreate venv then install on top.
        if [ ! -d "$DATA_VENV" ]; then
            echo "[entrypoint] First boot: copying venv to /data/venv..."
            cp -a /home/user/.local/venv "$DATA_VENV"
        else
            echo "[entrypoint] Rebuild detected: recreating /data/venv with new base packages..."
            # Preserve user-installed packages list before wiping
            USER_PKGS=""
            if [ -x "$DATA_VENV/bin/pip" ]; then
                USER_PKGS=$("$DATA_VENV/bin/pip" freeze 2>/dev/null | grep -v "^-e" || true)
            fi
            # Copy fresh venv from image (has new base deps)
            rm -rf "$DATA_VENV"
            cp -a /home/user/.local/venv "$DATA_VENV"
            # Re-install user's extra packages on top of the new base
            if [ -n "$USER_PKGS" ]; then
                echo "[entrypoint] Re-installing user packages..."
                echo "$USER_PKGS" | "$DATA_VENV/bin/pip" install -r /dev/stdin 2>/dev/null || true
            fi
        fi

        # Copy hermes source to /data/ (so `hermes update` can write here)
        if [ ! -d "$DATA_HERMES" ]; then
            echo "[entrypoint] First boot: copying hermes source to /data/hermes-source..."
            cp -a /home/user/agent-environment/hermes/agent "$DATA_HERMES"
        else
            echo "[entrypoint] Rebuild detected: updating /data/hermes-source..."
            # On rebuild: copy new source files over the existing /data/ version
            # This preserves any user modifications while pulling in new upstream files
            rsync -a --update /home/user/agent-environment/hermes/agent/ "$DATA_HERMES/" 2>/dev/null || \
            cp -a /home/user/agent-environment/hermes/agent/. "$DATA_HERMES/" 2>/dev/null || true
        fi

        # Copy npm global to /data/
        if [ ! -d "$DATA_NPM" ]; then
            echo "[entrypoint] First boot: copying npm-global to /data/npm-global..."
            cp -a /home/user/.npm-global "$DATA_NPM"
        else
            echo "[entrypoint] Rebuild detected: updating /data/npm-global..."
            rsync -a --update /home/user/.npm-global/ "$DATA_NPM/" 2>/dev/null || \
            cp -a /home/user/.npm-global/. "$DATA_NPM/" 2>/dev/null || true
        fi

        # Copy piper to /data/
        if [ ! -d "$DATA_PIPER" ]; then
            echo "[entrypoint] First boot: copying piper to /data/piper..."
            cp -a /home/user/piper "$DATA_PIPER"
        else
            echo "[entrypoint] Rebuild detected: updating /data/piper..."
            rsync -a --update /home/user/piper/ "$DATA_PIPER/" 2>/dev/null || \
            cp -a /home/user/piper/. "$DATA_PIPER/" 2>/dev/null || true
        fi

        # Re-install hermes in /data/ venv pointing at /data/ source
        # This makes `hermes update` (which does pip install) write to /data/
        echo "[entrypoint] Installing hermes in /data/venv from /data/hermes-source..."
        "$DATA_VENV/bin/pip" install -e "$DATA_HERMES[all]" 2>/dev/null || \
        "$DATA_VENV/bin/pip" install -e "$DATA_HERMES" 2>/dev/null || true

        # Write sentinel
        echo "$BUILD_VERSION" > "$DATA_SENTINEL"
        echo "[entrypoint] Sync complete. Build version: $BUILD_VERSION"
    fi

    # ── On every boot: activate /data/ versions ──────────────────

    # Use /data/ venv as the active Python environment
    if [ -d "$DATA_VENV" ]; then
        export PATH="$DATA_VENV/bin:$PATH"
        export VIRTUAL_ENV="$DATA_VENV"
        # Symlink key binaries into ~/.local/bin for compatibility
        mkdir -p "$HOME_DIR/.local/bin"
        ln -sf "$DATA_VENV/bin/python3" "$HOME_DIR/.local/bin/python3" 2>/dev/null || true
        ln -sf "$DATA_VENV/bin/pip3" "$HOME_DIR/.local/bin/pip3" 2>/dev/null || true
        ln -sf "$DATA_VENV/bin/hermes" "$HOME_DIR/.local/bin/hermes" 2>/dev/null || true
    fi

    # Use /data/ npm-global
    if [ -d "$DATA_NPM" ]; then
        export PATH="$DATA_NPM/bin:$PATH"
    fi

    # Use /data/ piper
    if [ -d "$DATA_PIPER" ]; then
        ln -sf "$DATA_PIPER/piper" "$HOME_DIR/.local/bin/piper" 2>/dev/null || true
    fi

    # Point hermes home at /data/ source so editable install + updates work
    if [ -d "$DATA_HERMES" ]; then
        ln -sfn "$DATA_HERMES" "$HOME_DIR/.hermes/hermes-agent" 2>/dev/null || true
    fi

    # ── Restore runtime state from /data/ ────────────────────────

    # Restore hermes config if user modified it at runtime
    if [ -f "$DATA_DIR/hermes-config/config.yaml" ]; then
        cp "$DATA_DIR/hermes-config/config.yaml" "$HOME_DIR/.hermes/config.yaml" 2>/dev/null || true
    fi

    # Restore openclaw configs if user modified them at runtime
    if [ -d "$DATA_DIR/openclaw-configs" ]; then
        cp -r "$DATA_DIR/openclaw-configs/"* "$HOME_DIR/.openclaw/" 2>/dev/null || true
    fi

    # Restore code-server user data
    if [ -d "$DATA_DIR/code-server-user-data/User" ]; then
        mkdir -p "$HOME_DIR/.local/share/code-server/User"
        cp -r "$DATA_DIR/code-server-user-data/User/"* "$HOME_DIR/.local/share/code-server/User/" 2>/dev/null || true
    fi

    # Restore bash history
    if [ -f "$DATA_DIR/bash-history/.bash_history" ]; then
        cp "$DATA_DIR/bash-history/.bash_history" "$HOME_DIR/.bash_history" 2>/dev/null || true
    fi

    # Restore hermes history
    if [ -d "$DATA_DIR/hermes-history/sessions" ]; then
        mkdir -p "$HOME_DIR/.hermes/hermes-agent/sessions"
        cp -r "$DATA_DIR/hermes-history/sessions/"* "$HOME_DIR/.hermes/hermes-agent/sessions/" 2>/dev/null || true
    fi

    # Restore openclaw sessions
    if [ -d "$DATA_DIR/openclaw-sessions/sessions" ]; then
        OC_AGENTS="$HOME_DIR/.openclaw/agents/main/sessions"
        mkdir -p "$OC_AGENTS"
        cp -r "$DATA_DIR/openclaw-sessions/sessions/"* "$OC_AGENTS/" 2>/dev/null || true
    fi
fi

# ── Start code-server with save-on-exit trap ────────────────────
save_runtime_state() {
    if [ ! -d "$DATA_DIR" ] || [ ! -w "$DATA_DIR" ]; then
        return
    fi
    # Save hermes config
    if [ -f "$HOME_DIR/.hermes/config.yaml" ]; then
        mkdir -p "$DATA_DIR/hermes-config"
        cp "$HOME_DIR/.hermes/config.yaml" "$DATA_DIR/hermes-config/config.yaml" 2>/dev/null || true
    fi

    # Save openclaw configs
    if [ -d "$HOME_DIR/.openclaw" ]; then
        mkdir -p "$DATA_DIR/openclaw-configs"
        cp -r "$HOME_DIR/.openclaw/"* "$DATA_DIR/openclaw-configs/" 2>/dev/null || true
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

while true; do sleep 300; save_runtime_state; done &
SAVE_PID=$!

trap save_runtime_state EXIT

exec code-server \
    --bind-addr 0.0.0.0:7860 \
    --auth none \
    --disable-telemetry \
    --disable-update-check \
    /home/user/agent-environment
