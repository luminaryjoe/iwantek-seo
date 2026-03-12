#!/usr/bin/env bash
set -euo pipefail

export DISPLAY=:99

# 检查是否已在运行
if [ -f /opt/openclaw/runtime/state/xvfb.pid ]; then
    PID=$(cat /opt/openclaw/runtime/state/xvfb.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Xvfb already running (PID: $PID)"
        exit 0
    fi
fi

echo "Starting Xvfb on display :99..."
Xvfb :99 -screen 0 1366x768x24 -ac +extension RANDR > /opt/openclaw/runtime/logs/xvfb.log 2>&1 &
echo $! > /opt/openclaw/runtime/state/xvfb.pid

echo "Xvfb started (PID: $!)"
echo "Display: :99"
