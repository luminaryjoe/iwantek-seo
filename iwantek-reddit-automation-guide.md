# iwantek.com Reddit 自动化工具配置与使用指南

## 🎉 已安装的 Reddit 技能

| 技能名 | 版本 | 功能 |
|--------|------|------|
| **reddit-marketing-geo** | 1.0.1 | 定时监控 Reddit，生成 GEO 优化回复草稿 |
| **reddit-post-lab** | 1.0.1 | 创建高价值、subreddit 原生帖子 |
| **reddit-assistant** | 2.0.0 | Reddit 内容创作助手，研究社区，跟踪数据 |

---

## 一、技能 1: Reddit Marketing GEO（定时监控）

### 功能
- 自动监控 Reddit 高意向帖子
- 生成 GEO 优化回复草稿
- 定时执行（默认 9 AM / 6 PM）
- 人工审核后发布

### 配置步骤

#### 步骤 1: 初始化配置

创建配置文件 `memory/config.json`:

```json
{
  "brand_name": "Wantek",
  "website": "https://www.iwantek.com",
  "keywords": [
    "call center headset",
    "office headset",
    "USB headset",
    "noise canceling microphone",
    "best headset for work",
    "headset recommendation",
    " Teams headset",
    "Zoom headset"
  ],
  "schedule": "0 9,18 * * *",
  "target_subreddits": [
    "CallCenterLife",
    "headphones",
    "WorkFromHome",
    "ITSupport",
    "VOIP",
    "techsupport",
    "CustomerService"
  ]
}
```

#### 步骤 2: 启动定时监控

```bash
# 运行技能
openclaw skill reddit-marketing-geo

# 或手动触发
openclaw skill reddit-marketing-geo --config memory/config.json
```

#### 步骤 3: 修改定时时间

```bash
# 改为每天 10 AM 和 8 PM
openclaw skill reddit-marketing-geo --schedule "0 10,20 * * *"
```

### 输出示例

```
🚀 Daily Reddit Digest Ready

Found 5 high-intent threads:

1. r/CallCenterLife - "What headset should I buy for 50 agents?"
   Draft ready for approval

2. r/headphones - "Best office headset under $50?"
   Draft ready for approval

3. r/WorkFromHome - "Headset keeps breaking, help!"
   Draft ready for approval

Reply "Go" or "Post" to approve each draft.
```

---

## 二、技能 2: Reddit Post Lab（创建原生帖子）

### 功能
- 创建高价值、subreddit 原生帖子
- 5 种帖子角度选择
- 生成 5 个标题选项
- 教育性内容 + 软性 CTA

### 使用方法

#### 方式 1: 命令行调用

```bash
openclaw skill reddit-post-lab \
  --product "Wantek H600 USB headset" \
  --audience "call center managers" \
  --subreddit "CallCenterLife" \
  --goal "profile visits"
```

#### 方式 2: 交互式使用

```
用户: 帮我创建一个 Reddit 帖子

系统: 请提供以下信息：
- 产品/主题: Wantek H600 USB headset
- 受众水平: 初学者/中级/高级
- 目标 subreddit: CallCenterLife
- 目标: 评论/收藏/个人主页访问/邮件注册

用户: Wantek H600, 中级, CallCenterLife, 个人主页访问

系统: 生成 5 个标题选项...
```

### 输出模板

```
标题选项:
1. "After testing 20 headsets for our call center, here's what actually matters"
2. "The $45 headset that outlasted my $120 one (real TCO analysis)"
3. "POV: You finally found a headset that doesn't hurt after 8 hours"
4. "Why our 150-agent center switched to USB headsets (data inside)"
5. "I tracked headset costs for 2 years. Here's what I learned."

推荐角度: Case Study (选项 2)

帖子内容:
[Hook]
The $45 headset that outlasted my $120 one

[Context]
I manage IT for a 150-agent call center. We used to buy "premium" 
headsets until I tracked actual costs...

[Main Value - 5 个要点]
1. Purchase price ≠ total cost
2. Lifespan varies by 3x between brands
3. Hidden costs: IT time, downtime, shipping
4. Weight matters for 8-hour shifts
5. Warranty length predicts reliability

[Example Case]
Cheap headset: $20, lasts 8 months = $30/year
Wantek H600: $45, lasts 24 months = $22.50/year

[CTA]
Has anyone else tracked TCO for headsets? What numbers are you seeing?

质量检查: ✅ 通过
- 真实性: 像真人而非营销
- 价值优先: 读者不点击也有收获
- 透明度: 清楚说明与产品的关系
- 具体性: 有具体数字
- CTA 质量: 真诚的问题
```

---

## 三、技能 3: Reddit Assistant（完整工作流）

### 功能
- 研究社区，找到最佳 subreddit
- 创建真实帖子（3 个角度）
- 跟踪真实性能数据
- 记录和分析结果

### 工作流 A: 撰写 Reddit 帖子

#### 步骤 1: 检查环境

```bash
bash /root/.openclaw/workspace/skills/reddit-assistant/scripts/check_env.sh
```

#### 步骤 2: 加载配置

```bash
python3 /root/.openclaw/workspace/skills/reddit-assistant/reddit-assistant.py status
```

#### 步骤 3: 创建帖子

```bash
# 模式: draft
python3 /root/.openclaw/workspace/skills/reddit-assistant/reddit-assistant.py \
  --mode draft \
  --product_description "Wantek H600 USB headset for call centers" \
  --milestone "Deployed 500+ units, reduced support tickets by 70%" \
  --goal "lesson/insight"
```

### 工作流 B: 研究社区

```bash
# 模式: research
python3 /root/.openclaw/workspace/skills/reddit-assistant/reddit-assistant.py \
  --mode research \
  --product_description "call center headsets"
```

输出:
```
推荐 Subreddits:

1. r/CallCenterLife (45K)
   - 相关性: ⭐⭐⭐⭐⭐
   - 活跃度: 高
   - 规则: 允许产品推荐，需 disclose
   - 最佳帖子类型: TCO 分析, 设备对比

2. r/headphones (485K)
   - 相关性: ⭐⭐⭐⭐
   - 活跃度: 很高
   - 规则: 禁止 spam，重视技术细节
   - 最佳帖子类型: 技术评测, 对比

3. r/WorkFromHome (890K)
   - 相关性: ⭐⭐⭐⭐
   - 活跃度: 很高
   - 规则: 允许设备推荐
   - 最佳帖子类型: 使用体验, 设置指南
```

### 工作流 C: 分析性能

```bash
# 模式: analyze
python3 /root/.openclaw/workspace/skills/reddit-assistant/reddit-assistant.py \
  --mode analyze \
  --days 30
```

输出:
```
Reddit 性能报告 (最近 30 天)

帖子统计:
- 总帖子数: 12
- 总 Upvotes: 1,247
- 总评论: 89
- 平均 Upvotes/帖子: 104
- 最高 Upvotes: 456

流量分析:
- 个人主页访问: 234
- 网站点击: 67
- 转化率: 28.6%

最佳表现帖子:
1. "TCO analysis from 150-agent center" - 456 upvotes
2. "USB vs 3.5mm: real world comparison" - 312 upvotes
3. "Why weight matters for 8-hour shifts" - 198 upvotes

建议:
- 继续 TCO/数据分析类内容
- 增加对比帖子频率
- 尝试 r/ITSupport 社区
```

### 工作流 D: 记录帖子

```bash
# 模式: log
python3 /root/.openclaw/workspace/skills/reddit-assistant/reddit-assistant.py \
  --mode log \
  --url "https://reddit.com/r/CallCenterLife/comments/xxxxx" \
  --subreddit "CallCenterLife" \
  --title "TCO analysis from 150-agent center"
```

---

## 四、综合自动化工作流

### 每日自动化流程

```bash
#!/bin/bash
# iwantek_reddit_daily.sh

echo "=== iwantek Reddit Daily Automation ==="
echo "Date: $(date)"

# 1. 运行 GEO 监控（生成回复草稿）
echo "[1/4] Running Reddit GEO monitoring..."
openclaw skill reddit-marketing-geo --silent

# 2. 生成 1 个新帖子草稿
echo "[2/4] Generating new post draft..."
openclaw skill reddit-post-lab \
  --product "Wantek H600" \
  --subreddit "CallCenterLife" \
  --output drafts/today.md

# 3. 分析昨日表现
echo "[3/4] Analyzing yesterday's performance..."
python3 reddit-assistant.py --mode analyze --days 1

# 4. 发送摘要邮件/通知
echo "[4/4] Sending summary..."
# 配置邮件发送...

echo "=== Done ==="
```

### 添加到 Cron

```bash
# 编辑 crontab
crontab -e

# 添加每日任务（10 AM 和 8 PM）
0 10,20 * * * /root/iwantek_reddit_daily.sh >> /var/log/iwantek_reddit.log 2>&1
```

---

## 五、配置 Reddit API（用于发布）

### 步骤 1: 创建 Reddit App

1. 访问 https://www.reddit.com/prefs/apps
2. 点击 "create another app..."
3. 选择 "script"
4. 填写信息:
   - Name: iwantek-automation
   - Description: Content automation for Wantek
   - About URL: https://www.iwantek.com
   - Redirect URI: http://localhost:8080
5. 保存 Client ID 和 Client Secret

### 步骤 2: 配置环境变量

```bash
# 添加到 ~/.bashrc
cat >> ~/.bashrc << 'EOF'
export REDDIT_CLIENT_ID="your_client_id"
export REDDIT_CLIENT_SECRET="your_client_secret"
export REDDIT_USERNAME="your_username"
export REDDIT_PASSWORD="your_password"
EOF

source ~/.bashrc
```

### 步骤 3: 验证配置

```bash
python3 -c "
import praw
reddit = praw.Reddit(
    client_id='$REDDIT_CLIENT_ID',
    client_secret='$REDDIT_CLIENT_SECRET',
    username='$REDDIT_USERNAME',
    password='$REDDIT_PASSWORD',
    user_agent='iwantek-automation/1.0'
)
print('Logged in as:', reddit.user.me())
"
```

---

## 六、安全与合规

### ⚠️ 重要提醒

1. **Rate Limiting**
   - Reddit API: 30 requests/minute
   - 建议间隔: 每条帖子至少 10 分钟
   - 新账号: 前 30 天限制更严格

2. **Shadowban 保护**
   - 所有回复基于线程上下文生成
   - 从不使用模板
   - 人工审核后再发布

3. **账号安全**
   - 使用专用账号（非个人账号）
   - 启用 2FA
   - 定期更换密码

4. **内容质量**
   - 价值优先，推广其次
   - 每次提及品牌都 disclose
   - 遵守每个 subreddit 的规则

---

## 七、完整文件结构

```
/root/iwantek-reddit/
├── config/
│   ├── config.json              # 品牌配置
│   └── subreddit-profiles.json  # 社区档案
├── drafts/
│   ├── pending/                 # 待审核草稿
│   ├── approved/                # 已批准草稿
│   └── posted/                  # 已发布帖子
├── memory/
│   ├── post-history.json        # 发布历史
│   └── performance-data.json    # 性能数据
├── scripts/
│   ├── daily_automation.sh      # 每日自动化
│   ├── check_env.sh             # 环境检查
│   └── save_draft.py            # 保存草稿
├── logs/
│   └── reddit_activity.log      # 活动日志
└── references/
    └── subreddit-guide.md       # 社区指南
```

---

## 八、快速开始

### 5 分钟启动

```bash
# 1. 克隆配置
cd /root/.openclaw/workspace
mkdir -p iwantek-reddit
cd iwantek-reddit

# 2. 创建配置文件
cat > config/config.json << 'EOF'
{
  "brand_name": "Wantek",
  "website": "https://www.iwantek.com",
  "keywords": ["call center headset", "office headset", "USB headset"],
  "schedule": "0 10,20 * * *",
  "target_subreddits": ["CallCenterLife", "headphones", "WorkFromHome"]
}
EOF

# 3. 配置 Reddit API
cat >> ~/.bashrc << 'EOF'
export REDDIT_CLIENT_ID="your_id"
export REDDIT_CLIENT_SECRET="your_secret"
export REDDIT_USERNAME="your_username"
export REDDIT_PASSWORD="your_password"
EOF
source ~/.bashrc

# 4. 运行第一次监控
openclaw skill reddit-marketing-geo

# 5. 生成第一个帖子
openclaw skill reddit-post-lab \
  --product "Wantek H600" \
  --subreddit "CallCenterLife"
```

---

**文件位置**: `/root/.openclaw/workspace/iwantek-reddit-automation-guide.md`

**GitHub**: https://github.com/luminaryjoe/iwantek-seo
