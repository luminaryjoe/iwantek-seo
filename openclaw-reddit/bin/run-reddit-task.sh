#!/bin/bash
# Reddit 自动化任务运行脚本 - 使用持久化 Profile

set -e

echo "=================================="
echo "Reddit 自动化任务"
echo "=================================="
echo ""

# 检查 Profile 是否存在
if [ ! -d /opt/openclaw/profiles/reddit-main ]; then
    echo "❌ Profile 目录不存在"
    echo "💡 请先运行首次登录："
    echo "   /opt/openclaw/bin/first-time-login.sh"
    exit 1
fi

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查 Xvfb
if ! pgrep -x "Xvfb" > /dev/null; then
    echo "🚀 启动 Xvfb..."
    /opt/openclaw/bin/start-display.sh
    sleep 2
fi

# 检查 Chromium
if ! pgrep -f "chromium" > /dev/null; then
    echo "🚀 启动 Chromium..."
    /opt/openclaw/bin/start-browser.sh
    sleep 3
fi

echo "✅ 服务已启动"
echo ""

# 检查登录状态
echo "🔍 检查 Reddit 登录状态..."
python3 /opt/openclaw/bin/check-reddit-session.py > /tmp/session-check.json 2>&1

SESSION_STATUS=$(cat /tmp/session-check.json | grep -o '"status": "[^"]*"' | cut -d'"' -f4)

if [ "$SESSION_STATUS" != "SESSION_OK" ]; then
    echo ""
    echo "❌ Reddit 会话已过期"
    echo "💡 需要重新登录："
    echo "   /opt/openclaw/bin/first-time-login.sh"
    echo ""
    echo "会话检查结果："
    cat /tmp/session-check.json
    exit 1
fi

echo "✅ Reddit 会话有效"
echo ""

# 运行自动化任务
echo "🎯 运行自动化任务..."
echo ""

# 默认发布内容
SUBREDDIT="${1:-CallCenterLife}"
TITLE="${2:-How I reduced headset costs by 40% without sacrificing quality}"

echo "📌 Subreddit: r/$SUBREDDIT"
echo "📝 Title: $TITLE"
echo ""

python3 /opt/openclaw/bin/reddit-automation.py post "$SUBREDDIT" "$TITLE"

echo ""
echo "✅ 任务完成"
echo "📊 结果保存在: /opt/openclaw/state/last-post.json"
