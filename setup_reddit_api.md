# Reddit API 配置与自动发布设置

## 第一步：获取 Reddit API 凭证

### 1. 登录 Reddit 并创建应用

1. 访问 https://www.reddit.com/prefs/apps
2. 向下滚动到 "developed apps" 部分
3. 点击 "create another app..."

### 2. 填写应用信息

```
Name: iwantek-automation
Description: Content automation for Wantek headset marketing
About URL: https://www.iwantek.com
Redirect URI: http://localhost:8080
```

**注意**：选择 "script" 类型（用于个人使用）

### 3. 保存凭证

创建后会显示：
- **Client ID** (14字符，如：`abc123def456gh`)
- **Client Secret** (27字符，如：`abc123def456ghi789jkl012mno345pqr`)

**重要**：立即保存，Client Secret 只显示一次！

---

## 第二步：配置环境变量

### 方法 A：临时配置（当前会话）

```bash
export REDDIT_CLIENT_ID="your_client_id_here"
export REDDIT_CLIENT_SECRET="your_client_secret_here"
export REDDIT_USERNAME="your_reddit_username"
export REDDIT_PASSWORD="your_reddit_password"
export REDDIT_USER_AGENT="iwantek-automation/1.0 by your_username"
```

### 方法 B：永久配置（推荐）

```bash
# 添加到 ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# Reddit API Configuration
export REDDIT_CLIENT_ID="your_client_id_here"
export REDDIT_CLIENT_SECRET="your_client_secret_here"
export REDDIT_USERNAME="your_reddit_username"
export REDDIT_PASSWORD="your_reddit_password"
export REDDIT_USER_AGENT="iwantek-automation/1.0 by your_username"
EOF

# 重新加载配置
source ~/.bashrc
```

### 方法 C：使用 .env 文件（更安全）

```bash
# 创建 .env 文件
cat > /root/.openclaw/workspace/iwantek-reddit/.env << 'EOF'
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=iwantek-automation/1.0 by your_username
EOF

# 加载环境变量
source /root/.openclaw/workspace/iwantek-reddit/.env
```

---

## 第三步：安装 Python 依赖

```bash
# 安装 praw (Python Reddit API Wrapper)
pip3 install praw

# 验证安装
python3 -c "import praw; print('praw installed successfully')"
```

---

## 第四步：验证 API 连接

创建测试脚本：

```bash
cat > /root/.openclaw/workspace/iwantek-reddit/test_api.py << 'EOF'
import os
import praw

# 从环境变量加载配置
client_id = os.getenv('REDDIT_CLIENT_ID')
client_secret = os.getenv('REDDIT_CLIENT_SECRET')
username = os.getenv('REDDIT_USERNAME')
password = os.getenv('REDDIT_PASSWORD')
user_agent = os.getenv('REDDIT_USER_AGENT')

# 验证配置
if not all([client_id, client_secret, username, password]):
    print("❌ Error: Missing Reddit API credentials")
    print("Please set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD")
    exit(1)

try:
    # 创建 Reddit 实例
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        username=username,
        password=password,
        user_agent=user_agent
    )
    
    # 测试连接
    user = reddit.user.me()
    print(f"✅ Successfully connected to Reddit!")
    print(f"   Logged in as: {user}")
    print(f"   Karma: {user.link_karma + user.comment_karma}")
    print(f"   Account created: {user.created_utc}")
    
    # 测试读取 subreddit
    subreddit = reddit.subreddit('CallCenterLife')
    print(f"\n✅ Subreddit access working:")
    print(f"   r/CallCenterLife: {subreddit.subscribers} subscribers")
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
EOF

# 运行测试
python3 /root/.openclaw/workspace/iwantek-reddit/test_api.py
```

---

## 第五步：创建自动发布脚本

### 脚本 1：发布帖子

```bash
cat > /root/.openclaw/workspace/iwantek-reddit/post_to_reddit.py << 'EOF'
#!/usr/bin/env python3
"""
Reddit Auto-Poster for iwantek
Usage: python3 post_to_reddit.py <subreddit> <title> <body_file>
"""

import os
import sys
import time
import praw
from datetime import datetime

def load_config():
    """Load Reddit API configuration from environment"""
    return {
        'client_id': os.getenv('REDDIT_CLIENT_ID'),
        'client_secret': os.getenv('REDDIT_CLIENT_SECRET'),
        'username': os.getenv('REDDIT_USERNAME'),
        'password': os.getenv('REDDIT_PASSWORD'),
        'user_agent': os.getenv('REDDIT_USER_AGENT', 'iwantek-automation/1.0')
    }

def connect_reddit(config):
    """Connect to Reddit API"""
    return praw.Reddit(
        client_id=config['client_id'],
        client_secret=config['client_secret'],
        username=config['username'],
        password=config['password'],
        user_agent=config['user_agent']
    )

def submit_post(reddit, subreddit_name, title, body, delay_minutes=0):
    """Submit a post to Reddit"""
    
    if delay_minutes > 0:
        print(f"⏳ Waiting {delay_minutes} minutes before posting...")
        time.sleep(delay_minutes * 60)
    
    try:
        subreddit = reddit.subreddit(subreddit_name)
        submission = subreddit.submit(title=title, selftext=body)
        
        print(f"✅ Post submitted successfully!")
        print(f"   URL: {submission.url}")
        print(f"   Title: {submission.title}")
        print(f"   Time: {datetime.now()}")
        
        # Log the post
        log_post(submission)
        
        return submission
        
    except Exception as e:
        print(f"❌ Error posting: {e}")
        return None

def log_post(submission):
    """Log post to file"""
    log_file = '/root/.openclaw/workspace/iwantek-reddit/logs/posts.log'
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    with open(log_file, 'a') as f:
        f.write(f"{datetime.now()} | {submission.id} | {submission.subreddit} | {submission.title} | {submission.url}\n")

def main():
    # Check arguments
    if len(sys.argv) < 4:
        print("Usage: python3 post_to_reddit.py <subreddit> <title> <body_file>")
        print("Example: python3 post_to_reddit.py CallCenterLife 'My Title' post_body.txt")
        sys.exit(1)
    
    subreddit = sys.argv[1]
    title = sys.argv[2]
    body_file = sys.argv[3]
    
    # Load body from file
    if not os.path.exists(body_file):
        print(f"❌ Error: Body file not found: {body_file}")
        sys.exit(1)
    
    with open(body_file, 'r') as f:
        body = f.read()
    
    # Load configuration
    config = load_config()
    if not all([config['client_id'], config['client_secret'], 
                config['username'], config['password']]):
        print("❌ Error: Reddit API credentials not configured")
        print("Please set environment variables:")
        print("  REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD")
        sys.exit(1)
    
    # Connect to Reddit
    print("🔌 Connecting to Reddit...")
    reddit = connect_reddit(config)
    print(f"✅ Connected as: {reddit.user.me()}\n")
    
    # Confirm before posting
    print("📋 Post Preview:")
    print(f"   Subreddit: r/{subreddit}")
    print(f"   Title: {title}")
    print(f"   Body length: {len(body)} characters")
    print(f"\n⚠️  Ready to post? (yes/no): ", end='')
    
    confirmation = input().lower()
    if confirmation not in ['yes', 'y']:
        print("❌ Post cancelled")
        sys.exit(0)
    
    # Submit post
    print("\n🚀 Submitting post...")
    submission = submit_post(reddit, subreddit, title, body)
    
    if submission:
        print("\n✅ Post published successfully!")
        print(f"   View at: {submission.url}")
    else:
        print("\n❌ Failed to publish post")
        sys.exit(1)

if __name__ == '__main__':
    main()
EOF

chmod +x /root/.openclaw/workspace/iwantek-reddit/post_to_reddit.py
```

### 脚本 2：批量发布

```bash
cat > /root/.openclaw/workspace/iwantek-reddit/batch_post.py << 'EOF'
#!/usr/bin/env python3
"""
Batch Reddit Poster for iwantek
Posts multiple submissions with delays between them
"""

import os
import sys
import time
import json
import praw
from datetime import datetime
from random import randint

class RedditPoster:
    def __init__(self):
        self.config = self.load_config()
        self.reddit = self.connect_reddit()
        self.posted = []
    
    def load_config(self):
        """Load configuration"""
        return {
            'client_id': os.getenv('REDDIT_CLIENT_ID'),
            'client_secret': os.getenv('REDDIT_CLIENT_SECRET'),
            'username': os.getenv('REDDIT_USERNAME'),
            'password': os.getenv('REDDIT_PASSWORD'),
            'user_agent': os.getenv('REDDIT_USER_AGENT', 'iwantek-automation/1.0')
        }
    
    def connect_reddit(self):
        """Connect to Reddit"""
        return praw.Reddit(
            client_id=self.config['client_id'],
            client_secret=self.config['client_secret'],
            username=self.config['username'],
            password=self.config['password'],
            user_agent=self.config['user_agent']
        )
    
    def post_single(self, subreddit, title, body, min_delay=10, max_delay=20):
        """Post with random delay"""
        try:
            # Random delay between posts (10-20 minutes)
            delay = randint(min_delay, max_delay)
            print(f"⏳ Waiting {delay} minutes before next post...")
            time.sleep(delay * 60)
            
            # Submit post
            sub = self.reddit.subreddit(subreddit)
            submission = sub.submit(title=title, selftext=body)
            
            print(f"✅ Posted: {submission.title}")
            print(f"   URL: {submission.url}")
            
            self.posted.append({
                'id': submission.id,
                'subreddit': subreddit,
                'title': title,
                'url': submission.url,
                'time': datetime.now().isoformat()
            })
            
            return submission
            
        except Exception as e:
            print(f"❌ Error posting to r/{subreddit}: {e}")
            return None
    
    def batch_post(self, posts_file):
        """Batch post from JSON file"""
        with open(posts_file, 'r') as f:
            posts = json.load(f)
        
        print(f"📦 Loaded {len(posts)} posts to publish\n")
        
        for i, post in enumerate(posts, 1):
            print(f"\n[{i}/{len(posts)}] Processing post...")
            print(f"   Subreddit: r/{post['subreddit']}")
            print(f"   Title: {post['title']}")
            
            self.post_single(
                post['subreddit'],
                post['title'],
                post['body']
            )
        
        # Save report
        self.save_report()
    
    def save_report(self):
        """Save posting report"""
        report_file = f"/root/.openclaw/workspace/iwantek-reddit/logs/batch_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        
        with open(report_file, 'w') as f:
            json.dump(self.posted, f, indent=2)
        
        print(f"\n📊 Report saved: {report_file}")
        print(f"   Total posted: {len(self.posted)}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 batch_post.py <posts_json_file>")
        print("Example: python3 batch_post.py posts_to_publish.json")
        sys.exit(1)
    
    posts_file = sys.argv[1]
    
    if not os.path.exists(posts_file):
        print(f"❌ File not found: {posts_file}")
        sys.exit(1)
    
    poster = RedditPoster()
    print(f"✅ Connected as: {poster.reddit.user.me()}\n")
    
    # Confirm
    print("⚠️  This will publish multiple posts to Reddit.")
    print("   Make sure you've reviewed all content.")
    print("\nContinue? (yes/no): ", end='')
    
    if input().lower() not in ['yes', 'y']:
        print("❌ Cancelled")
        sys.exit(0)
    
    poster.batch_post(posts_file)

if __name__ == '__main__':
    main()
EOF

chmod +x /root/.openclaw/workspace/iwantek-reddit/batch_post.py
```

---

## 第六步：创建示例帖子文件

```bash
# 创建示例 JSON 文件
cat > /root/.openclaw/workspace/iwantek-reddit/posts_to_publish.json << 'EOF'
[
  {
    "subreddit": "CallCenterLife",
    "title": "The $45 headset that outlasted my $120 one (real TCO analysis)",
    "body": "I manage IT for a 150-agent call center... [full post content]"
  },
  {
    "subreddit": "headphones",
    "title": "My neck stopped hurting when I switched to this 110g headset",
    "body": "8 hours a day with a 135g headset... [full post content]"
  }
]
EOF
```

---

## 第七步：使用示例

### 发布单个帖子

```bash
# 1. 设置环境变量
source /root/.openclaw/workspace/iwantek-reddit/.env

# 2. 创建帖子内容
cat > /tmp/post1.txt << 'POST'
I manage IT for a 150-agent call center...
[完整帖子内容]
POST

# 3. 发布
python3 /root/.openclaw/workspace/iwantek-reddit/post_to_reddit.py \
  CallCenterLife \
  "The $45 headset that outlasted my $120 one" \
  /tmp/post1.txt
```

### 批量发布

```bash
# 1. 准备 JSON 文件（已创建）

# 2. 批量发布
python3 /root/.openclaw/workspace/iwantek-reddit/batch_post.py \
  /root/.openclaw/workspace/iwantek-reddit/posts_to_publish.json
```

---

## ⚠️ 安全与合规

### Rate Limiting
- Reddit API: 30 requests/minute
- 建议间隔：10-20分钟/帖子
- 新账号限制更严格

### Shadowban 保护
- 所有内容人工审核后再发布
- 不违反 subreddit 规则
- 保持价值优先原则

### 账号安全
- 使用专用账号（非个人）
- 启用 2FA
- 定期更换密码

---

## 📋 完整文件结构

```
/root/.openclaw/workspace/iwantek-reddit/
├── .env                          # API 凭证（保密）
├── setup_reddit_api.md           # 本指南
├── test_api.py                   # API 测试脚本
├── post_to_reddit.py             # 单帖发布
├── batch_post.py                 # 批量发布
├── posts_to_publish.json         # 待发布帖子
└── logs/
    └── posts.log                 # 发布日志
```

---

## 🚀 快速开始（5分钟）

### 1. 获取 API 凭证
- 访问 https://www.reddit.com/prefs/apps
- 创建 "script" 应用
- 保存 Client ID 和 Client Secret

### 2. 配置环境变量
```bash
# 编辑 .env 文件
nano /root/.openclaw/workspace/iwantek-reddit/.env

# 填入你的凭证
REDDIT_CLIENT_ID=your_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password
```

### 3. 测试连接
```bash
source /root/.openclaw/workspace/iwantek-reddit/.env
python3 /root/.openclaw/workspace/iwantek-reddit/test_api.py
```

### 4. 发布第一个帖子
```bash
python3 /root/.openclaw/workspace/iwantek-reddit/post_to_reddit.py \
  CallCenterLife \
  "Test post title" \
  /path/to/body.txt
```

---

**下一步**：请提供你的 Reddit API 凭证，我将完成配置并运行测试。
