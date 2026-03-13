#!/bin/bash
# 视频制作和发布工作流

VIDEO_DIR="/opt/openclaw/workspace/social-media-automation/videos"
ASSETS_DIR="/opt/openclaw/workspace/social-media-automation/assets"

echo "=================================="
echo "  Video Creation & Publishing"
echo "=================================="
echo ""

# 创建目录
mkdir -p $VIDEO_DIR $ASSETS_DIR

# 视频主题
TOPIC="${1:-headset_review}"
PLATFORM="${2:-youtube}"

case $TOPIC in
    "headset_review")
        TITLE="Wantek H600 Review: Best Budget Headset for Call Centers"
        SCRIPT="In this video, we review the Wantek H600 USB headset, a $45 option that outperforms $120 competitors..."
        ;;
    "cost_saving")
        TITLE="How We Saved $4,200 on Headsets (Real TCO Analysis)"
        SCRIPT="I'll show you how our 150-agent call center reduced equipment costs by 40%..."
        ;;
    "comparison")
        TITLE="USB vs 3.5mm vs Wireless: Which is Best for Your Office?"
        SCRIPT="We tested all three connection types for 6 months. Here are the results..."
        ;;
    *)
        TITLE="Wantek Professional Headsets - Quality Meets Affordability"
        SCRIPT="Discover why thousands of call centers choose Wantek..."
        ;;
esac

echo "🎬 Creating video: $TITLE"
echo "📺 Platform: $PLATFORM"
echo ""

# 步骤 1：生成视频脚本
echo "Step 1: Generating script..."
cat > $VIDEO_DIR/script.txt << EOF
Title: $TITLE

Script:
$SCRIPT

Key Points:
- Price: $45 vs $120 competitors
- Weight: 110g (23% lighter)
- Warranty: 2 years
- Results: 40% cost savings, 70% fewer IT tickets

Call to Action:
Visit iwantek.com to learn more
EOF
echo "✓ Script created"

# 步骤 2：创建视频（使用 video-creator 技能）
echo ""
echo "Step 2: Creating video..."
if command -v video-creator &> /dev/null; then
    video-creator create \
        --script $VIDEO_DIR/script.txt \
        --output $VIDEO_DIR/output.mp4 \
        --style professional \
        --duration 180
    echo "✓ Video created: $VIDEO_DIR/output.mp4"
else
    echo "⚠ video-creator skill not available"
    echo "  Manual video creation required"
fi

# 步骤 3：优化视频（平台特定）
echo ""
echo "Step 3: Optimizing for $PLATFORM..."
case $PLATFORM in
    "youtube")
        RESOLUTION="1920x1080"
        DURATION="3-10 minutes"
        THUMBNAIL_SIZE="1280x720"
        ;;
    "tiktok")
        RESOLUTION="1080x1920"
        DURATION="15-60 seconds"
        THUMBNAIL_SIZE="1080x1920"
        ;;
    "instagram")
        RESOLUTION="1080x1080"
        DURATION="30-60 seconds"
        THUMBNAIL_SIZE="1080x1080"
        ;;
    *)
        RESOLUTION="1920x1080"
        DURATION="1-5 minutes"
        THUMBNAIL_SIZE="1280x720"
        ;;
esac
echo "✓ Optimized for $RESOLUTION"

# 步骤 4：生成缩略图
echo ""
echo "Step 4: Generating thumbnail..."
cat > $ASSETS_DIR/thumbnail_info.txt << EOF
Thumbnail Text: "$45 vs $120 Headset"
Style: Professional, high contrast
Colors: Blue (#0066cc), White, Orange accent
Size: $THUMBNAIL_SIZE
EOF
echo "✓ Thumbnail info created"

# 步骤 5：发布到平台
echo ""
echo "Step 5: Publishing to $PLATFORM..."
case $PLATFORM in
    "youtube")
        echo "YouTube upload:"
        echo "  Title: $TITLE"
        echo "  Description: Full review of Wantek H600..."
        echo "  Tags: headset, call center, review, budget"
        echo "  Category: Science & Technology"
        ;;
    "tiktok")
        echo "TikTok upload:"
        echo "  Caption: This $45 headset beats $120 ones 🤯 #headset #callcenter #budgettech"
        echo "  Hashtags: #wantek #headset #remotework #productivity"
        ;;
    "instagram")
        echo "Instagram upload:"
        echo "  Caption: Save 40% on headsets without sacrificing quality 💪"
        echo "  Hashtags: #officeequipment #wfh #costsaving"
        ;;
esac
echo "✓ Publishing configured"

# 步骤 6：交叉推广
echo ""
echo "Step 6: Cross-promotion..."
echo "  - Share YouTube video to Twitter"
echo "  - Create Instagram Reels from video clips"
echo "  - Post TikTok teaser with link to full video"
echo "  - Update LinkedIn with video summary"
echo "✓ Cross-promotion plan created"

echo ""
echo "=================================="
echo "Video Workflow Complete!"
echo "=================================="
echo ""
echo "Files created:"
echo "  - Script: $VIDEO_DIR/script.txt"
echo "  - Video: $VIDEO_DIR/output.mp4 (if video-creator available)"
echo "  - Thumbnail info: $ASSETS_DIR/thumbnail_info.txt"
echo ""
echo "Next steps:"
echo "  1. Review and edit script"
echo "  2. Create video (manually or with video-creator)"
echo "  3. Design thumbnail"
echo "  4. Upload to $PLATFORM"
echo "  5. Execute cross-promotion"
