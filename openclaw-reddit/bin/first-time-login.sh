#!/bin/bash
# 首次登录脚本 - 人工完成 Reddit 登录

set -e

echo "=================================="
echo "Reddit 首次登录配置"
echo "=================================="
echo ""

# 检查服务状态
echo "🔍 检查服务状态..."
if ! pgrep -x "Xvfb" > /dev/null; then
    echo "🚀 启动 Xvfb..."
    /opt/openclaw/bin/start-display.sh
    sleep 2
fi

if ! pgrep -f "chromium" > /dev/null; then
    echo "🚀 启动 Chromium..."
    /opt/openclaw/bin/start-browser.sh
    sleep 3
fi

echo "✅ 服务已启动"
echo ""

# 显示连接信息
echo "📋 连接信息："
echo "   远程调试端口: 9222"
echo "   Profile 目录: /opt/openclaw/profiles/reddit-main"
echo ""

# 创建连接指南
cat << 'GUIDE'
╔════════════════════════════════════════════════════════════╗
║  请在本地电脑执行以下步骤完成首次登录：                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  方法 1：使用 SSH 隧道（推荐）                              ║
║  ─────────────────────────────                             ║
║  1. 在本地 PowerShell 执行：                                ║
║     ssh -L 9222:localhost:9222 root@your-server-ip         ║
║                                                            ║
║  2. 保持 PowerShell 窗口打开                                ║
║                                                            ║
║  3. 浏览器访问：http://localhost:9222                      ║
║                                                            ║
║  4. 点击 "Open DevTools"                                   ║
║                                                            ║
║  5. 导航到：https://www.reddit.com/login                   ║
║                                                            ║
║  6. 完成登录（用户名、密码、CAPTCHA）                       ║
║                                                            ║
║  7. 登录成功后，保持浏览器打开 10 秒                        ║
║                                                            ║
║  8. 返回此窗口，按 Enter 键确认                             ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  方法 2：使用 VNC（如果配置了）                             ║
║  ─────────────────────────────                             ║
║  1. VNC 客户端连接到服务器:5900                            ║
║                                                            ║
║  2. 在 VNC 中打开 Chromium 浏览器                          ║
║                                                            ║
║  3. 访问 Reddit 并完成登录                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

GUIDE

echo ""
echo "⏳ 等待登录完成..."
echo "（登录完成后，按 Enter 键保存状态）"
read -p ""

# 验证登录状态
echo ""
echo "🔍 验证登录状态..."
python3 /opt/openclaw/bin/check-reddit-session.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 登录状态已保存！"
    echo "📁 Profile 位置: /opt/openclaw/profiles/reddit-main"
    echo ""
    echo "🎉 现在可以运行自动化任务了："
    echo "   python3 /opt/openclaw/bin/reddit-automation.py post CallCenterLife 'Your Title'"
else
    echo ""
    echo "❌ 登录状态验证失败"
    echo "💡 请确保已成功登录 Reddit"
    echo ""
    echo "重新运行此脚本："
    echo "   /opt/openclaw/bin/first-time-login.sh"
fi
