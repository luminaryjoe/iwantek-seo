# Post Bridge API 配置与自动化发布指南

## 一、获取 Post Bridge API Key

### 步骤 1: 注册 Post Bridge 账号
1. 访问 https://post-bridge.com
2. 点击 "Sign Up" 注册账号
3. 验证邮箱
4. 登录到 Dashboard

### 步骤 2: 获取 API Key
1. 进入 Settings → API Keys
2. 点击 "Generate New API Key"
3. 复制生成的 API Key
4. 保存到安全位置（只显示一次）

### 步骤 3: 配置环境变量

**方法 A - 临时配置（当前会话）**:
```bash
export POST_BRIDGE_API_KEY="your_api_key_here"
```

**方法 B - 永久配置（推荐）**:
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
echo 'export POST_BRIDGE_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc
```

**方法 C - 使用 .env 文件**:
```bash
# 创建 .env 文件
cat > /root/.openclaw/workspace/.env << 'EOF'
POST_BRIDGE_API_KEY=your_api_key_here
EOF

# 加载环境变量
source /root/.openclaw/workspace/.env
```

---

## 二、连接社交媒体账号

### 连接 TikTok 账号
1. 在 Post Bridge Dashboard 点击 "Add Account"
2. 选择 "TikTok"
3. 扫描二维码或输入账号密码
4. 授权 Post Bridge 访问
5. 记录 `social_account_id`（在 Dashboard 中查看）

### 连接 Instagram 账号
1. 点击 "Add Account"
2. 选择 "Instagram"
3. 登录 Instagram 账号
4. 授权访问
5. 记录 `social_account_id`

### 连接 YouTube 账号
1. 点击 "Add Account"
2. 选择 "YouTube"
3. 登录 Google 账号
4. 授权 YouTube 访问
5. 记录 `social_account_id`

---

## 三、自动化发布脚本

### 脚本 1: 单次发布

```bash
#!/bin/bash
# post_single.sh - 发布单个视频

API_KEY="$POST_BRIDGE_API_KEY"
API_BASE="https://api.post-bridge.com/v1"

# 上传媒体文件
upload_media() {
    local file_path="$1"
    
    # 获取上传 URL
    response=$(curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "filename": "'$(basename $file_path)'",
            "content_type": "video/mp4"
        }' \
        "$API_BASE/media/create-upload-url")
    
    upload_url=$(echo $response | jq -r '.upload_url')
    media_id=$(echo $response | jq -r '.media_id')
    
    # 上传文件
    curl -s -X PUT \
        -H "Content-Type: video/mp4" \
        --data-binary "@$file_path" \
        "$upload_url"
    
    echo "$media_id"
}

# 创建帖子
create_post() {
    local media_id="$1"
    local caption="$2"
    local account_id="$3"
    local scheduled_at="$4"  # ISO 8601 format, optional
    
    data='{
        "caption": "'$caption'",
        "media_ids": ["'$media_id'"],
        "social_account_ids": ["'$account_id'"]
    }'
    
    if [ -n "$scheduled_at" ]; then
        data=$(echo $data | jq --arg time "$scheduled_at" '. + {"scheduled_at": $time}')
    fi
    
    curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$API_BASE/posts"
}

# 使用示例
# media_id=$(upload_media "/path/to/video.mp4")
# create_post "$media_id" "Check out this headset! #wantek" "tiktok_account_id"
```

### 脚本 2: 批量定时发布

```bash
#!/bin/bash
# post_scheduled.sh - 批量定时发布

API_KEY="$POST_BRIDGE_API_KEY"
API_BASE="https://api.post-bridge.com/v1"

# 配置文件格式（CSV）:
# video_path,caption,platform,scheduled_time
# /videos/1.mp4,Great headset!,tiktok,2024-03-15T10:00:00Z

CONFIG_FILE="$1"

while IFS=',' read -r video_path caption platform scheduled_time; do
    # 跳过标题行
    [[ "$video_path" == "video_path" ]] && continue
    
    echo "Processing: $video_path"
    
    # 上传媒体
    media_response=$(curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"filename\": \"$(basename $video_path)\", \"content_type\": \"video/mp4\"}" \
        "$API_BASE/media/create-upload-url")
    
    upload_url=$(echo $media_response | jq -r '.upload_url')
    media_id=$(echo $media_response | jq -r '.media_id')
    
    # 上传文件
    curl -s -X PUT \
        -H "Content-Type: video/mp4" \
        --data-binary "@$video_path" \
        "$upload_url"
    
    # 获取账号 ID
    account_id=$(curl -s -H "Authorization: Bearer $API_KEY" \
        "$API_BASE/social-accounts" | jq -r ".[] | select(.platform == \"$platform\") | .id")
    
    # 创建定时帖子
    curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"caption\": \"$caption\",
            \"media_ids\": [\"$media_id\"],
            \"social_account_ids\": [\"$account_id\"],
            \"scheduled_at\": \"$scheduled_time\"
        }" \
        "$API_BASE/posts"
    
    echo "Scheduled for $scheduled_time"
    
    # 等待 5 秒避免 rate limit
    sleep 5
    
done < "$CONFIG_FILE"

echo "All posts scheduled!"
```

### 脚本 3: 间隔发布（10-20分钟）

```bash
#!/bin/bash
# post_interval.sh - 间隔发布

API_KEY="$POST_BRIDGE_API_KEY"
API_BASE="https://api.post-bridge.com/v1"

# 配置
VIDEO_DIR="/path/to/videos"
CAPTIONS_FILE="/path/to/captions.txt"
PLATFORM="tiktok"  # or instagram, youtube
ACCOUNT_ID="your_account_id"
MIN_INTERVAL=600   # 10 minutes in seconds
MAX_INTERVAL=1200  # 20 minutes in seconds

# 读取所有视频文件
videos=($VIDEO_DIR/*.mp4)

# 读取所有文案（每行一个）
mapfile -t captions < "$CAPTIONS_FILE"

# 检查数量匹配
if [ ${#videos[@]} -ne ${#captions[@]} ]; then
    echo "Error: Number of videos (${#videos[@]}) doesn't match captions (${#captions[@]})"
    exit 1
fi

# 发布循环
for i in "${!videos[@]}"; do
    video="${videos[$i]}"
    caption="${captions[$i]}"
    
    echo "[$((i+1))/${#videos[@]}] Processing: $(basename $video)"
    
    # 上传媒体
    media_response=$(curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"filename\": \"$(basename $video)\", \"content_type\": \"video/mp4\"}" \
        "$API_BASE/media/create-upload-url")
    
    media_id=$(echo $media_response | jq -r '.media_id')
    upload_url=$(echo $media_response | jq -r '.upload_url')
    
    curl -s -X PUT \
        -H "Content-Type: video/mp4" \
        --data-binary "@$video" \
        "$upload_url"
    
    # 发布帖子
    curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"caption\": \"$caption\",
            \"media_ids\": [\"$media_id\"],
            \"social_account_ids\": [\"$ACCOUNT_ID\"]
        }" \
        "$API_BASE/posts"
    
    echo "Posted successfully!"
    
    # 如果不是最后一个，等待随机间隔
    if [ $i -lt $((${#videos[@]}-1)) ]; then
        interval=$((RANDOM % (MAX_INTERVAL - MIN_INTERVAL + 1) + MIN_INTERVAL))
        echo "Waiting $(($interval / 60)) minutes before next post..."
        sleep $interval
    fi
done

echo "All posts completed!"
```

---

## 四、iwantek 内容发布示例

### 内容日历（30天）

```csv
video_path,caption,platform,scheduled_time
/videos/day1.mp4,"POV: Finally found a headset that doesn't hurt after 8 hours 🎧 #wantek #callcenter #headset",tiktok,2024-03-15T10:00:00Z
/videos/day2.mp4,"The $45 headset that outlasted my $120 one 💪 #wantek #budgettech #officegear",tiktok,2024-03-15T14:30:00Z
/videos/day3.mp4,"My neck stopped hurting when I switched to this 110g headset #wantek #ergonomics #wfh",tiktok,2024-03-16T11:00:00Z
```

### 文案模板库

**模板 1: POV 风格**
```
POV: Finally found a headset that doesn't hurt after 8 hours 🎧

#wantek #callcenter #headset #officelife #wfh
```

**模板 2: 对比风格**
```
The $45 headset that outlasted my $120 one 💪

Sometimes cheaper is actually better

#wantek #budgettech #officegear #techreview
```

**模板 3: 问题解决**
```
My neck stopped hurting when I switched to this 110g headset

(Industry average is 143g 😬)

#wantek #ergonomics #wfh #health
```

**模板 4: 使用场景**
```
When your headset blocks out the office chaos ☕️

40dB noise canceling hits different

#wantek #focus #productivity #openoffice
```

---

## 五、运行自动化发布

### 步骤 1: 准备内容
```bash
# 创建视频目录
mkdir -p /root/iwantek-content/videos
mkdir -p /root/iwantek-content/scripts

# 放置视频文件
cp *.mp4 /root/iwantek-content/videos/

# 创建文案文件
cat > /root/iwantek-content/captions.txt << 'EOF'
POV: Finally found a headset that doesn't hurt after 8 hours 🎧 #wantek #callcenter #headset
The $45 headset that outlasted my $120 one 💪 #wantek #budgettech #officegear
My neck stopped hurting when I switched to this 110g headset #wantek #ergonomics #wfh
EOF
```

### 步骤 2: 配置 API Key
```bash
export POST_BRIDGE_API_KEY="your_actual_api_key_here"
```

### 步骤 3: 运行发布脚本
```bash
# 单次发布
./post_single.sh

# 批量定时发布
./post_scheduled.sh /path/to/schedule.csv

# 间隔发布（10-20分钟）
./post_interval.sh
```

---

## 六、监控与跟踪

### 查看发布状态
```bash
curl -s -H "Authorization: Bearer $POST_BRIDGE_API_KEY" \
    "https://api.post-bridge.com/v1/posts" | jq
```

### 查看特定帖子状态
```bash
POST_ID="your_post_id"
curl -s -H "Authorization: Bearer $POST_BRIDGE_API_KEY" \
    "https://api.post-bridge.com/v1/post-results?post_id=$POST_ID" | jq
```

### UTM 跟踪链接
在文案中使用 UTM 参数跟踪效果：
```
Check out Wantek headsets: https://www.iwantek.com/?utm_source=tiktok&utm_medium=social&utm_campaign=organic&utm_content=video_001
```

---

## 七、安全与合规

### ⚠️ 重要提醒

1. **遵守平台规则**
   - 不要发布违反社区准则的内容
   - 避免过度营销（spam）
   - 保持内容质量

2. **Rate Limiting**
   - TikTok: 建议每小时最多 1-2 条
   - Instagram: 建议每小时最多 1 条
   - 脚本已内置 5 秒延迟

3. **账号安全**
   - 不要将 API Key 提交到 Git
   - 使用 .env 文件并添加到 .gitignore
   - 定期轮换 API Key

4. **内容原创性**
   - 确保视频内容原创或已获得授权
   - 避免版权音乐（使用平台音乐库）

---

## 八、故障排除

### 常见问题

**问题 1: API Key 无效**
```
Error: 401 Unauthorized
```
解决: 检查 API Key 是否正确，是否已过期

**问题 2: 账号未连接**
```
Error: Social account not found
```
解决: 在 Post Bridge Dashboard 中连接账号

**问题 3: 视频上传失败**
```
Error: Upload failed
```
解决: 检查视频格式（MP4）、大小（<500MB）、时长（<60s for TikTok）

**问题 4: Rate Limited**
```
Error: 429 Too Many Requests
```
解决: 增加发布间隔时间

---

## 九、完整工作流示例

```bash
#!/bin/bash
# iwantek_daily_post.sh - 每日发布工作流

# 加载环境变量
source /root/.openclaw/workspace/.env

# 配置
VIDEO_DIR="/root/iwantek-content/videos"
CAPTIONS_FILE="/root/iwantek-content/captions.txt"
LOG_FILE="/root/iwantek-content/post_log.txt"

# 获取今日要发布的视频（假设每天发布 3 条）
TODAY=$(date +%Y-%m-%d)
DAY_NUM=$(date +%d | sed 's/^0//')
START_INDEX=$(( (DAY_NUM - 1) * 3 ))

# 发布 3 条内容，间隔 15 分钟
for i in 0 1 2; do
    INDEX=$((START_INDEX + i))
    
    # 获取视频和文案
    VIDEO=$(ls -1 $VIDEO_DIR/*.mp4 | sed -n "$((INDEX+1))p")
    CAPTION=$(sed -n "$((INDEX+1))p" $CAPTIONS_FILE)
    
    if [ -z "$VIDEO" ] || [ -z "$CAPTION" ]; then
        echo "[$TODAY] No more content for today" >> $LOG_FILE
        break
    fi
    
    # 发布
    echo "[$TODAY $(date +%H:%M)] Posting: $(basename $VIDEO)" >> $LOG_FILE
    
    # 这里调用发布脚本
    # ./post_single.sh "$VIDEO" "$CAPTION"
    
    # 等待 15 分钟（如果不是最后一条）
    if [ $i -lt 2 ]; then
        sleep 900
    fi
done

echo "[$TODAY $(date +%H:%M)] Daily posting completed" >> $LOG_FILE
```

---

**配置完成后，运行以下命令开始自动化发布：**

```bash
# 1. 设置 API Key
export POST_BRIDGE_API_KEY="your_api_key"

# 2. 运行发布脚本
./iwantek_daily_post.sh

# 或添加到 crontab 定时运行
crontab -e
# 添加: 0 10 * * * /root/iwantek_daily_post.sh
```

**文件位置**: `/root/.openclaw/workspace/iwantek-post-bridge-setup.md`
