#!/bin/bash
set -uo pipefail

AGENT_ENV_DIR="/home/user/agent-environment"
DATA_DIR="/data"
HOME_DIR="$HOME"

# ── Build version detection ─────────────────────────────────────
# Hash key files to detect image rebuilds. When the hash changes,
# we re-sync the base image's installs into /data/ while preserving
# user modifications.
calc_build_version() {
    { md5sum "$AGENT_ENV_DIR/Dockerfile" 2>/dev/null || echo "no-dockerfile"
      md5sum "$AGENT_ENV_DIR/requirements/pip-requirements.txt" 2>/dev/null || echo "no-reqs"
      md5sum "$AGENT_ENV_DIR/hermes/agent/pyproject.toml" 2>/dev/null || echo "no-pyproject"
    } | md5sum | cut -d' ' -f1
}

BUILD_VERSION=$(calc_build_version)
DATA_SENTINEL="$DATA_DIR/.build-version"

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

# ── Substitute env vars into hermes config.yaml ────────────────
# YAML doesn't do shell variable substitution — Hermes reads the
# literal string. We must replace ${VAR:-} patterns with actual values.
HERMES_CONFIG="$HOME_DIR/.hermes/config.yaml"
if [ -f "$HERMES_CONFIG" ]; then
    for var in NVIDIA_API_KEY OPENROUTER_API_KEY; do
        val="${!var}"
        sed -i "s|\${${var}:-}|${val}|g" "$HERMES_CONFIG"
    done
fi

# ── /data/ persistence: universal install survival ──────────────
# Everything the agent (or user) installs persists across rebuilds:
#   pip install  → /data/venv/          (Python venv)
#   npm install -g → /data/npm-global/  (npm global)
#   hermes update → /data/hermes-source/ (editable install target)
#   curl to ~/.local/bin/ → /data/local-bin/ (symlinked)
#   apt-get install → /data/apt-packages.txt (record & replay)
#   go install     → /data/go/          (GOPATH)
#   cargo install  → /data/cargo/       (CARGO_HOME)
#   ~/workspace/*  → /data/workspace/   (symlinked)
#
# On image rebuild (detected via build version sentinel), we:
#   - Refresh /data/venv/ with new base packages + re-install user extras
#   - rsync --update new hermes/npm/piper source into /data/
#   - Re-install apt packages from /data/apt-packages.txt
#   - Restore custom apt repos/keys from /data/apt-sources/

if [ -d "$DATA_DIR" ] && [ -w "$DATA_DIR" ]; then
    DATA_VENV="$DATA_DIR/venv"
    DATA_HERMES="$DATA_DIR/hermes-source"
    DATA_NPM="$DATA_DIR/npm-global"
    DATA_PIPER="$DATA_DIR/piper"
    DATA_LOCAL_BIN="$DATA_DIR/local-bin"
    DATA_WORKSPACE="$DATA_DIR/workspace"
    APT_BASE_LIST=""
    APT_USER_LIST="$DATA_DIR/apt-packages.txt"
    APT_SOURCES_DIR="$DATA_DIR/apt-sources"

    # ── Create /data/ directory structure ────────────────────────
 mkdir -p "$DATA_DIR/code-server-user-data" \
 "$DATA_DIR/hermes-history" \
 "$DATA_DIR/hermes-config" \
 "$DATA_DIR/hermes-memories" \
 "$DATA_DIR/openclaw-sessions" \
 "$DATA_DIR/openclaw-configs" \
 "$DATA_DIR/bash-history" \
 "$DATA_LOCAL_BIN" \
 "$DATA_WORKSPACE" \
 "$DATA_DIR/go" \
 "$DATA_DIR/cargo" \
 "$DATA_DIR/rustup" \
 "$APT_SOURCES_DIR"

    # ── Symlinks: make /data/ the transparent default ────────────
    # ~/.local/bin → /data/local-bin/  (any binary the agent drops here persists)
    ln -sfn "$DATA_LOCAL_BIN" "$HOME_DIR/.local/bin"

    # ~/workspace → /data/workspace/  (agent's working directory persists)
    ln -sfn "$DATA_WORKSPACE" "$HOME_DIR/workspace"

    # ── Cargo setup ──────────────────────────────────────────────
    [ ! -f "$DATA_DIR/cargo/config.toml" ] && touch "$DATA_DIR/cargo/config.toml"

    # ── Apt base image snapshot ──────────────────────────────────
    # On first boot of any image, record which packages the base image
    # already has. This lets us diff later to find only USER-installed
    # packages (not the 300+ base image packages).
    IMAGE_ID=$(md5sum /etc/apt/sources.list 2>/dev/null | cut -d' ' -f1 || echo 'default')
    APT_BASE_LIST="$DATA_DIR/apt-base-${IMAGE_ID}.txt"

    if [ ! -f "$APT_BASE_LIST" ]; then
        echo "[entrypoint] Snapshotting base image apt packages..."
        dpkg-query -W -f '${Package}\n' 2>/dev/null | sort > "$APT_BASE_LIST"
    fi

    # ── Restore apt repos/keys ───────────────────────────────────
    # If the agent added PPAs or custom repos, restore them before
    # apt-get install so the packages can be found.
    if [ -d "$APT_SOURCES_DIR/sources.list.d" ] && [ "$(ls -A "$APT_SOURCES_DIR/sources.list.d" 2>/dev/null)" ]; then
        echo "[entrypoint] Restoring custom apt sources..."
        cp -r "$APT_SOURCES_DIR/sources.list.d/"* /etc/apt/sources.list.d/ 2>/dev/null || true
    fi
    if [ -d "$APT_SOURCES_DIR/keyrings" ] && [ "$(ls -A "$APT_SOURCES_DIR/keyrings" 2>/dev/null)" ]; then
        echo "[entrypoint] Restoring custom apt keys..."
        cp -r "$APT_SOURCES_DIR/keyrings/"* /usr/share/keyrings/ 2>/dev/null || true
    fi

    # ── Restore apt packages ─────────────────────────────────────
    # Re-install any packages the agent added that aren't in the base image.
    if [ -f "$APT_USER_LIST" ] && [ -s "$APT_USER_LIST" ]; then
        TO_INSTALL=$(comm -23 <(sort "$APT_USER_LIST") <(dpkg-query -W -f '${Package}\n' 2>/dev/null | sort) 2>/dev/null || true)
        if [ -n "$TO_INSTALL" ]; then
            echo "[entrypoint] Restoring user-installed apt packages..."
            sudo apt-get update -qq 2>/dev/null
            echo "$TO_INSTALL" | xargs sudo apt-get install -y --no-install-recommends -qq 2>/dev/null || true
        fi
    fi

    # ── First boot or image rebuild: sync build-time installs ────
    PREV_BUILD_VERSION=""
    if [ -f "$DATA_SENTINEL" ]; then
        PREV_BUILD_VERSION=$(cat "$DATA_SENTINEL")
    fi

    if [ "$BUILD_VERSION" != "$PREV_BUILD_VERSION" ]; then
        echo "[entrypoint] Image rebuilt (build $PREV_BUILD_VERSION -> $BUILD_VERSION). Syncing to /data/..."

        # Python venv: first boot = full copy, rebuild = fresh base + user extras
        if [ ! -d "$DATA_VENV" ]; then
            echo "[entrypoint] First boot: copying venv to /data/venv..."
            cp -a /home/user/.local/venv "$DATA_VENV"
        else
            echo "[entrypoint] Rebuild: recreating /data/venv with new base packages..."
            USER_PKGS=""
            if [ -x "$DATA_VENV/bin/pip" ]; then
                USER_PKGS=$("$DATA_VENV/bin/pip" freeze 2>/dev/null | grep -v "^-e" || true)
            fi
            rm -rf "$DATA_VENV"
            cp -a /home/user/.local/venv "$DATA_VENV"
            if [ -n "$USER_PKGS" ]; then
                echo "[entrypoint] Re-installing user pip packages..."
                echo "$USER_PKGS" | "$DATA_VENV/bin/pip" install -r /dev/stdin 2>/dev/null || true
            fi
        fi

        # Hermes source: first boot = copy, rebuild = rsync (preserves user changes)
        if [ ! -d "$DATA_HERMES" ]; then
            echo "[entrypoint] First boot: copying hermes source to /data/hermes-source..."
            cp -a /home/user/agent-environment/hermes/agent "$DATA_HERMES"
        else
            echo "[entrypoint] Rebuild: updating /data/hermes-source..."
            rsync -a --update /home/user/agent-environment/hermes/agent/ "$DATA_HERMES/" 2>/dev/null || \
            cp -a /home/user/agent-environment/hermes/agent/. "$DATA_HERMES/" 2>/dev/null || true
        fi

        # npm global: same pattern
        if [ ! -d "$DATA_NPM" ]; then
            echo "[entrypoint] First boot: copying npm-global to /data/npm-global..."
            cp -a /home/user/.npm-global "$DATA_NPM"
        else
            echo "[entrypoint] Rebuild: updating /data/npm-global..."
            rsync -a --update /home/user/.npm-global/ "$DATA_NPM/" 2>/dev/null || \
            cp -a /home/user/.npm-global/. "$DATA_NPM/" 2>/dev/null || true
        fi

        # Piper: same pattern
        if [ ! -d "$DATA_PIPER" ]; then
            echo "[entrypoint] First boot: copying piper to /data/piper..."
            cp -a /home/user/piper "$DATA_PIPER"
        else
            echo "[entrypoint] Rebuild: updating /data/piper..."
            rsync -a --update /home/user/piper/ "$DATA_PIPER/" 2>/dev/null || \
            cp -a /home/user/piper/. "$DATA_PIPER/" 2>/dev/null || true
        fi

        # Re-install hermes in /data/ venv pointing at /data/ source
        echo "[entrypoint] Installing hermes in /data/venv from /data/hermes-source..."
        "$DATA_VENV/bin/pip" install -e "$DATA_HERMES[all]" 2>/dev/null || \
        "$DATA_VENV/bin/pip" install -e "$DATA_HERMES" 2>/dev/null || true

        # Seed local-bin with build-time binaries (opencode, piper symlink)
        if [ -x /usr/local/bin/opencode ]; then
            ln -sf /usr/local/bin/opencode "$DATA_LOCAL_BIN/opencode" 2>/dev/null || true
        fi
        if [ -d "$DATA_PIPER" ]; then
            ln -sf "$DATA_PIPER/piper/piper" "$DATA_LOCAL_BIN/piper" 2>/dev/null || true
        fi

        echo "$BUILD_VERSION" > "$DATA_SENTINEL"
        echo "[entrypoint] Sync complete. Build version: $BUILD_VERSION"
    fi

    # ── On every boot: activate /data/ versions ──────────────────
    # Python venv
    if [ -d "$DATA_VENV" ]; then
        export PATH="$DATA_VENV/bin:$PATH"
        export VIRTUAL_ENV="$DATA_VENV"
        ln -sf "$DATA_VENV/bin/python3" "$DATA_LOCAL_BIN/python3" 2>/dev/null || true
        ln -sf "$DATA_VENV/bin/pip3" "$DATA_LOCAL_BIN/pip3" 2>/dev/null || true
        ln -sf "$DATA_VENV/bin/hermes" "$DATA_LOCAL_BIN/hermes" 2>/dev/null || true
    fi

    # npm global
    if [ -d "$DATA_NPM" ]; then
        export PATH="$DATA_NPM/bin:$PATH"
    fi

    # Go
    if [ -d "$DATA_DIR/go" ]; then
        export GOPATH="$DATA_DIR/go"
        export PATH="$DATA_DIR/go/bin:$PATH"
    fi

    # Cargo/Rust
    if [ -d "$DATA_DIR/cargo" ]; then
        export CARGO_HOME="$DATA_DIR/cargo"
        export RUSTUP_HOME="$DATA_DIR/rustup"
        export PATH="$DATA_DIR/cargo/bin:$PATH"
    fi

    # Point hermes home at /data/ source
    if [ -d "$DATA_HERMES" ]; then
        ln -sfn "$DATA_HERMES" "$HOME_DIR/.hermes/hermes-agent" 2>/dev/null || true
    fi

# ── Restore runtime state from /data/ ────────────────────────
# IMPORTANT: Hermes config.yaml uses ${VAR:-} template references for API keys.
# If we restore the persisted config, old resolved keys would override new
# HF Secrets. Instead, always start from the fresh template (which has ${VAR:-}
# references), then overlay user model/provider changes from /data/ if any.
# The fresh template gets current secret values at runtime.
# (No config.yaml restore from /data/ — secrets always come from env)
if [ -d "$DATA_DIR/openclaw-configs" ]; then
        cp -r "$DATA_DIR/openclaw-configs/"* "$HOME_DIR/.openclaw/" 2>/dev/null || true
    fi
    if [ -d "$DATA_DIR/code-server-user-data/User" ]; then
        mkdir -p "$HOME_DIR/.local/share/code-server/User"
        cp -r "$DATA_DIR/code-server-user-data/User/"* "$HOME_DIR/.local/share/code-server/User/" 2>/dev/null || true
    fi
    if [ -f "$DATA_DIR/bash-history/.bash_history" ]; then
        cp "$DATA_DIR/bash-history/.bash_history" "$HOME_DIR/.bash_history" 2>/dev/null || true
    fi
    if [ -d "$DATA_DIR/hermes-history/sessions" ]; then
        mkdir -p "$HOME_DIR/.hermes/hermes-agent/sessions"
        cp -r "$DATA_DIR/hermes-history/sessions/"* "$HOME_DIR/.hermes/hermes-agent/sessions/" 2>/dev/null || true
    fi
if [ -d "$DATA_DIR/openclaw-sessions/sessions" ]; then
    OC_AGENTS="$HOME_DIR/.openclaw/agents/main/sessions"
    mkdir -p "$OC_AGENTS"
    cp -r "$DATA_DIR/openclaw-sessions/sessions/"* "$OC_AGENTS/" 2>/dev/null || true
fi
# Hermes memories (MEMORY.md, USER.md) — always restore from /data/
if [ -d "$DATA_DIR/hermes-memories" ]; then
    mkdir -p "$HOME_DIR/.hermes/memories"
    cp -r "$DATA_DIR/hermes-memories/"* "$HOME_DIR/.hermes/memories/" 2>/dev/null || true
fi
# SOUL.md — always restore from /data/ if present
if [ -f "$DATA_DIR/hermes-config/SOUL.md" ]; then
    cp "$DATA_DIR/hermes-config/SOUL.md" "$HOME_DIR/.hermes/SOUL.md" 2>/dev/null || true
fi
fi

# ── Background state tracker ────────────────────────────────────
# Runs every 60s to persist all mutable state to /data/.
# This is the core of the autonomous persistence system — the agent
# just runs normal install commands and this loop captures them.
save_runtime_state() {
    if [ ! -d "$DATA_DIR" ] || [ ! -w "$DATA_DIR" ]; then
        return
    fi

    # Apt packages: diff current vs base image → user-installed only
    if [ -n "$APT_BASE_LIST" ] && [ -f "$APT_BASE_LIST" ]; then
        comm -23 <(dpkg-query -W -f '${Package}\n' 2>/dev/null | sort) \
                 <(sort "$APT_BASE_LIST" 2>/dev/null) \
                 > "$APT_USER_LIST.tmp" 2>/dev/null || true
        mv "$APT_USER_LIST.tmp" "$APT_USER_LIST" 2>/dev/null || true
    fi

    # Apt sources & keys
    if [ -d /etc/apt/sources.list.d ]; then
        mkdir -p "$APT_SOURCES_DIR/sources.list.d" "$APT_SOURCES_DIR/keyrings"
        cp -r /etc/apt/sources.list.d/* "$APT_SOURCES_DIR/sources.list.d/" 2>/dev/null || true
        cp -r /usr/share/keyrings/* "$APT_SOURCES_DIR/keyrings/" 2>/dev/null || true
    fi

    # Pip freeze (user extras for rebuild recovery)
    if [ -x "$DATA_VENV/bin/pip" ]; then
        "$DATA_VENV/bin/pip" freeze 2>/dev/null > "$DATA_DIR/pip-freeze.txt.tmp" || true
        mv "$DATA_DIR/pip-freeze.txt.tmp" "$DATA_DIR/pip-freeze.txt" 2>/dev/null || true
    fi

 # Hermes config — persist user model/provider changes, but note:
 # we DON'T restore this on boot (to avoid overriding fresh secrets).
 # It serves as a backup user can inspect in /data/hermes-config/.
 if [ -f "$HOME_DIR/.hermes/config.yaml" ]; then
 mkdir -p "$DATA_DIR/hermes-config"
 cp "$HOME_DIR/.hermes/config.yaml" "$DATA_DIR/hermes-config/config.yaml" 2>/dev/null || true
 fi

 # SOUL.md (agent personality)
 if [ -f "$HOME_DIR/.hermes/SOUL.md" ]; then
 mkdir -p "$DATA_DIR/hermes-config"
 cp "$HOME_DIR/.hermes/SOUL.md" "$DATA_DIR/hermes-config/SOUL.md" 2>/dev/null || true
 fi

 # Hermes memories (MEMORY.md, USER.md)
 if [ -d "$HOME_DIR/.hermes/memories" ]; then
 mkdir -p "$DATA_DIR/hermes-memories"
 cp -r "$HOME_DIR/.hermes/memories/"* "$DATA_DIR/hermes-memories/" 2>/dev/null || true
 fi

    # Openclaw configs
    if [ -d "$HOME_DIR/.openclaw" ]; then
        mkdir -p "$DATA_DIR/openclaw-configs"
        cp -r "$HOME_DIR/.openclaw/"* "$DATA_DIR/openclaw-configs/" 2>/dev/null || true
    fi

    # Code-server settings
    if [ -d "$HOME_DIR/.local/share/code-server/User" ]; then
        mkdir -p "$DATA_DIR/code-server-user-data/User"
        cp -r "$HOME_DIR/.local/share/code-server/User/"* "$DATA_DIR/code-server-user-data/User/" 2>/dev/null || true
    fi

    # Bash history
    if [ -f "$HOME_DIR/.bash_history" ]; then
        mkdir -p "$DATA_DIR/bash-history"
        cp "$HOME_DIR/.bash_history" "$DATA_DIR/bash-history/.bash_history" 2>/dev/null || true
    fi

    # Hermes history
    if [ -d "$HOME_DIR/.hermes/hermes-agent/sessions" ]; then
        mkdir -p "$DATA_DIR/hermes-history/sessions"
        cp -r "$HOME_DIR/.hermes/hermes-agent/sessions/"* "$DATA_DIR/hermes-history/sessions/" 2>/dev/null || true
    fi

    # Openclaw sessions
    OC_SESS="$HOME_DIR/.openclaw/agents/main/sessions"
    if [ -d "$OC_SESS" ]; then
        mkdir -p "$DATA_DIR/openclaw-sessions/sessions"
        cp -r "$OC_SESS/"* "$DATA_DIR/openclaw-sessions/sessions/" 2>/dev/null || true
    fi
}

while true; do sleep 60; save_runtime_state; done &
SAVE_PID=$!

trap 'save_runtime_state; kill $SAVE_PID 2>/dev/null' EXIT

exec code-server \
    --bind-addr 0.0.0.0:7860 \
    --auth none \
    --disable-telemetry \
    --disable-update-check \
    /home/user/agent-environment
