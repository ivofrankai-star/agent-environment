#!/bin/bash
set -e

source /home/user/agent-environment/bootstrap.sh

exec code-server \
  --bind-addr 0.0.0.0:7860 \
  --auth none \
  --disable-telemetry \
  --disable-update-check \
  /home/user/agent-environment
