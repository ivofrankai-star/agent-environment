FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HOME=/home/user
ENV HERMES_HOME=/home/user/.hermes
ENV OPENCLAW_HOME=/home/user/.openclaw
ENV PATH="/home/user/.local/bin:/home/user/.npm-global/bin:/home/user/.local/venv/bin:${PATH}"

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential python3 python3-pip python3-venv \
  nodejs npm git curl wget ffmpeg ripgrep \
  libffi-dev python3-dev procps ca-certificates \
  espeak-ng jq \
  && rm -rf /var/lib/apt/lists/*

ENV CODE_SERVER_VERSION=4.116.0
RUN curl -fOL https://github.com/coder/code-server/releases/download/v${CODE_SERVER_VERSION}/code-server_${CODE_SERVER_VERSION}_amd64.deb \
  && dpkg -i code-server_${CODE_SERVER_VERSION}_amd64.deb \
  && rm code-server_${CODE_SERVER_VERSION}_amd64.deb

ENV OPENCODE_VERSION=1.14.22
RUN curl -fsSL https://github.com/anomalyco/opencode/releases/download/v${OPENCODE_VERSION}/opencode-linux-x64.tar.gz \
  | tar xz -C /usr/local/bin opencode \
  && chmod +x /usr/local/bin/opencode

RUN useradd -m -s /bin/bash user \
  && mkdir -p /home/user/.config/code-server \
  /home/user/.local/share/code-server \
  /home/user/.local/bin \
  /home/user/.npm-global \
  /home/user/piper/voices \
  && chown -R user:user /home/user

WORKDIR /home/user/agent-environment
COPY --chown=user:user . /home/user/agent-environment
COPY --chown=user:user config/code-server.yaml /home/user/.config/code-server/config.yaml

USER user

RUN python3 -m venv /home/user/.local/venv && \
  /home/user/.local/venv/bin/pip install --upgrade pip setuptools wheel && \
  /home/user/.local/venv/bin/pip install -r /home/user/agent-environment/requirements/pip-requirements.txt && \
  ln -sf /home/user/.local/venv/bin/pip3 /home/user/.local/bin/pip3 && \
  ln -sf /home/user/.local/venv/bin/python3 /home/user/.local/bin/python3

RUN . /home/user/.local/venv/bin/activate && \
  cd /home/user/agent-environment/hermes/agent && \
  pip install -e ".[all]" || pip install -e . ; \
  deactivate

RUN mkdir -p /home/user/.npm-global && \
  npm config set prefix /home/user/.npm-global && \
  npm install -g openclaw clawdbot 2>/dev/null || true

RUN cd /home/user/agent-environment/hermes/agent && \
  npm install --prefer-offline --no-audit 2>/dev/null || true

RUN bash /home/user/agent-environment/bootstrap.sh

RUN curl -fsSL https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
  | tar xz -C /home/user/piper/ \
  && chown -R user:user /home/user/piper

RUN curl -fsSL -o /home/user/piper/voices/en_US-kusal-medium.onnx \
  "https://huggingface.co/ivofrank/agent-environment-storage/resolve/main/en_US-kusal-medium.onnx" || true

RUN code-server --install-extension ms-python.python && \
  code-server --install-extension redhat.vscode-yaml && \
  code-server --install-extension eamodio.gitlens

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:7860/ || exit 1

ENTRYPOINT ["/home/user/agent-environment/entrypoint.sh"]
