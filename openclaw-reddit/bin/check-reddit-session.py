#!/usr/bin/env python3
"""
检查 Reddit 会话状态
返回: SESSION_OK 或 SESSION_EXPIRED
"""

import sys
import json
from playwright.sync_api import sync_playwright

def check_reddit_session():
    """检查 Reddit 是否已登录"""
    
    profile_dir = "/opt/openclaw/profiles/reddit-main"
    
    with sync_playwright() as p:
        # 启动浏览器，使用持久化 profile
        browser = p.chromium.launch_persistent_context(
            profile_dir,
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        )
        
        page = browser.new_page()
        
        try:
            # 访问 Reddit
            page.goto("https://www.reddit.com/", wait_until="networkidle")
            
            # 检查 URL
            if page.url.startswith("https://www.reddit.com/login"):
                return False, "Redirected to login page"
            
            # 检查页面内容
            content = page.content().lower()
            
            # 登录指标
            login_indicators = [
                "log in" in content,
                "sign up" in content and "avatar" not in content
            ]
            
            if all(login_indicators):
                return False, "Login page detected"
            
            # 检查用户菜单
            user_menu = page.locator('[aria-label="User menu"]').count()
            if user_menu > 0:
                return True, "User menu found"
            
            # 检查头像
            avatar = page.locator('[href*="/user/"]').count()
            if avatar > 0:
                return True, "User link found"
            
            return False, "Unknown state"
            
        except Exception as e:
            return False, f"Error: {str(e)}"
        finally:
            browser.close()

if __name__ == "__main__":
    is_logged_in, message = check_reddit_session()
    
    result = {
        "status": "SESSION_OK" if is_logged_in else "SESSION_EXPIRED",
        "message": message,
        "timestamp": json.dumps({})
    }
    
    print(json.dumps(result, indent=2))
    
    sys.exit(0 if is_logged_in else 1)
