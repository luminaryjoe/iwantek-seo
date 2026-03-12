#!/usr/bin/env bash
set -euo pipefail

export DISPLAY=:99

PROFILE_DIR=/opt/openclaw/profiles/reddit-main
mkdir -p "$PROFILE_DIR"

# 检查是否已在运行
if [ -f /opt/openclaw/runtime/state/chromium.pid ]; then
    PID=$(cat /opt/openclaw/runtime/state/chromium.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Chromium already running (PID: $PID)"
        echo "Remote debugging port: 9222"
        exit 0
    fi
fi

echo "Starting Chromium with profile: $PROFILE_DIR"

chromium \
    --user-data-dir="$PROFILE_DIR" \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-gpu \
    --disable-web-security \
    --disable-features=IsolateOrigins,site-per-process \
    --disable-blink-features=AutomationControlled \
    --window-size=1366,768 \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    > /opt/openclaw/runtime/logs/chromium.log 2>&1 &

echo $! > /opt/openclaw/runtime/state/chromium.pid

echo "Chromium started (PID: $!)"
echo "Profile: $PROFILE_DIR"
echo "Remote debugging: http://localhost:9222"
echo ""
echo "To access browser:"
echo "  - Local: chromium --remote-debugging-port=9222"
echo "  - VNC: (if configured)"
