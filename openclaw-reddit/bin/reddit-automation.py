#!/usr/bin/env python3
"""
Reddit 自动化任务执行器
支持: 发帖、评论、监控
"""

import sys
import json
import time
import random
from datetime import datetime
from playwright.sync_api import sync_playwright

class RedditAutomation:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.profile_dir = "/opt/openclaw/profiles/reddit-main"
    
    def init_browser(self):
        """初始化浏览器"""
        print("🚀 启动浏览器...")
        
        p = sync_playwright().start()
        
        self.context = p.chromium.launch_persistent_context(
            self.profile_dir,
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1366,768'
            ]
        )
        
        # 反检测脚本
        self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        """)
        
        self.page = self.context.new_page()
        print("✅ 浏览器初始化完成")
    
    def check_login(self):
        """检查登录状态"""
        print("🔍 检查登录状态...")
        
        self.page.goto("https://www.reddit.com/", wait_until="networkidle")
        
        if self.page.url.startswith("https://www.reddit.com/login"):
            return False
        
        user_menu = self.page.locator('[aria-label="User menu"]').count()
        return user_menu > 0
    
    def create_post(self, subreddit, title, body):
        """创建帖子"""
        print(f"\n🎯 准备发布到 r/{subreddit}...")
        
        try:
            # 访问发帖页
            self.page.goto(f"https://www.reddit.com/r/{subreddit}/submit", 
                          wait_until="networkidle")
            
            # 检查登录
            if not self.check_login():
                raise Exception("Not logged in")
            
            # 填写标题
            print("📝 填写标题...")
            title_input = self.page.locator('role=textbox[name*="Title" i]').first
            title_input.fill(title)
            
            # 填写内容
            print("📝 填写内容...")
            body_input = self.page.locator('role=textbox[name*="Body" i], [contenteditable="true"]').first
            body_input.fill(body)
            
            # 随机延迟
            delay = random.randint(2000, 4000)
            print(f"⏳ 等待 {delay}ms...")
            time.sleep(delay / 1000)
            
            # 点击发布
            print("🖱️ 点击发布...")
            submit_btn = self.page.locator('role=button[name*="Post" i]').first
            submit_btn.click()
            
            # 等待跳转
            self.page.wait_for_url(lambda url: "/comments/" in url, timeout=20000)
            
            post_url = self.page.url
            print(f"\n✅ 发布成功!")
            print(f"🔗 URL: {post_url}")
            
            # 保存结果
            result = {
                "success": True,
                "url": post_url,
                "subreddit": subreddit,
                "title": title,
                "timestamp": datetime.now().isoformat()
            }
            
            with open("/opt/openclaw/state/last-post.json", "w") as f:
                json.dump(result, f, indent=2)
            
            return result
            
        except Exception as e:
            print(f"\n❌ 发布失败: {e}")
            
            # 截图
            self.page.screenshot(path=f"/opt/openclaw/runtime/screenshots/error-{int(time.time())}.png")
            
            return {
                "success": False,
                "error": str(e)
            }
    
    def close(self):
        """关闭浏览器"""
        if self.context:
            self.context.close()
            print("🔒 浏览器已关闭")

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("Usage: reddit-automation.py <command> [args]")
        print("Commands: check, post")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "check":
        # 检查会话
        auto = RedditAutomation()
        auto.init_browser()
        is_logged_in = auto.check_login()
        auto.close()
        
        if is_logged_in:
            print("✅ SESSION_OK")
            sys.exit(0)
        else:
            print("❌ SESSION_EXPIRED")
            sys.exit(1)
    
    elif command == "post":
        # 发布帖子
        if len(sys.argv) < 4:
            print("Usage: reddit-automation.py post <subreddit> <title>")
            sys.exit(1)
        
        subreddit = sys.argv[2]
        title = sys.argv[3]
        
        # 默认内容
        body = """I manage IT for a 150-agent call center. Six months ago, we were bleeding money on "premium" headsets that kept breaking.

The problem:
- $120 headsets lasting 8-12 months
- 47 IT tickets per year just for headset issues
- Agents complaining about comfort after 6-hour shifts

The turning point:
I started tracking actual TCO (total cost of ownership). Turns out our "cheap" $20 headsets were costing $30/year because they died every 8 months. Our "premium" $120 headsets? $60/year over 2 years.

What we switched to:
Wantek H600 at $45. Same 2-year warranty as the $120 units. Lighter (110g vs 135g). Better noise canceling (40dB).

The results after 18 months:
- Headset spend: down 40%
- IT tickets: down 70%
- Agent complaints: down 85%
- Customer satisfaction: up 12%

The lesson I learned: Purchase price is a terrible metric. TCO is what actually matters.

Has anyone else done this analysis? What did you find?

(I consult with Wantek now, but this data convinced me to work with them.)"""
        
        auto = RedditAutomation()
        auto.init_browser()
        result = auto.create_post(subreddit, title, body)
        auto.close()
        
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["success"] else 1)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
