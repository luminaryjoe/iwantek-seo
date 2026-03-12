#!/usr/bin/env bash
set -euo pipefail

echo "Stopping services..."

# Stop Chromium
if [ -f /opt/openclaw/runtime/state/chromium.pid ]; then
    PID=$(cat /opt/openclaw/runtime/state/chromium.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Stopping Chromium (PID: $PID)..."
        kill "$PID" 2>/dev/null || true
        sleep 2
    fi
    rm -f /opt/openclaw/runtime/state/chromium.pid
fi

# Stop Xvfb
if [ -f /opt/openclaw/runtime/state/xvfb.pid ]; then
    PID=$(cat /opt/openclaw/runtime/state/xvfb.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Stopping Xvfb (PID: $PID)..."
        kill "$PID" 2>/dev/null || true
        sleep 1
    fi
    rm -f /opt/openclaw/runtime/state/xvfb.pid
fi

echo "All services stopped"
