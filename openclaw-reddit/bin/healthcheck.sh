#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Reddit Automation Health Check ==="
echo ""

# Check Xvfb
if [ -f /opt/openclaw/runtime/state/xvfb.pid ]; then
    PID=$(cat /opt/openclaw/runtime/state/xvfb.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Xvfb running (PID: $PID)"
    else
        echo "❌ Xvfb not running (stale PID file)"
    fi
else
    echo "❌ Xvfb not running"
fi

# Check Chromium
if [ -f /opt/openclaw/runtime/state/chromium.pid ]; then
    PID=$(cat /opt/openclaw/runtime/state/chromium.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Chromium running (PID: $PID)"
        echo "   Remote debugging: http://localhost:9222"
    else
        echo "❌ Chromium not running (stale PID file)"
    fi
else
    echo "❌ Chromium not running"
fi

# Check profile
echo ""
echo "Profile status:"
if [ -d /opt/openclaw/profiles/reddit-main ]; then
    SIZE=$(du -sh /opt/openclaw/profiles/reddit-main 2>/dev/null | cut -f1)
    echo "✅ Profile exists ($SIZE)"
    
    # Check for login indicators
    if [ -f /opt/openclaw/profiles/reddit-main/Default/Cookies ]; then
        echo "✅ Cookies found"
    fi
else
    echo "❌ Profile not found"
fi

# Check logs
echo ""
echo "Recent logs:"
if [ -f /opt/openclaw/runtime/logs/chromium.log ]; then
    echo "Chromium log: $(wc -l < /opt/openclaw/runtime/logs/chromium.log) lines"
fi
if [ -f /opt/openclaw/runtime/logs/xvfb.log ]; then
    echo "Xvfb log: $(wc -l < /opt/openclaw/runtime/logs/xvfb.log) lines"
fi

echo ""
echo "=============================================="
