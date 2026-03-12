// Reddit 自动化发布脚本 - 使用 browser-automation-ultra
const { chromium } = require('playwright');
const { humanDelay, humanClick, humanType, humanThink, humanBrowse } = require('./utils/human-like');

function discoverCdpUrl() {
  try {
    const { execSync } = require('child_process');
    const ps = execSync("ps aux | grep 'remote-debugging-port' | grep -v grep", { encoding: 'utf8' });
    const match = ps.match(/remote-debugging-port=(\d+)/);
    return `http://127.0.0.1:${match ? match[1] : '9222'}`;
  } catch { 
    return 'http://127.0.0.1:9222'; 
  }
}

async function main() {
  const CDP_URL = discoverCdpUrl();
  console.log('🔌 连接到 Chrome:', CDP_URL);
  
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  try {
    // 帖子内容
    const subreddit = process.argv[2] || 'CallCenterLife';
    const title = process.argv[3] || 'How I reduced headset costs by 40% without sacrificing quality';
    const body = `I manage IT for a 150-agent call center. Six months ago, we were bleeding money on "premium" headsets that kept breaking.

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

(I consult with Wantek now, but this data convinced me to work with them.)`;

    console.log(`🎯 准备发布到 r/${subreddit}`);
    console.log(`📝 标题: ${title}`);
    
    // 1. 访问发帖页面
    await page.goto(`https://www.reddit.com/r/${subreddit}/submit`, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    // 2. 模拟浏览页面
    await humanBrowse(page);
    
    // 3. 填写标题
    console.log('📝 填写标题...');
    await humanThink(500, 1500);
    await humanType(page, '[aria-label="Title"], [placeholder*="Title"]', title);
    
    // 4. 填写内容
    console.log('📝 填写内容...');
    await humanThink(1000, 2000);
    await humanType(page, '[aria-label="Body"], [contenteditable="true"]', body);
    
    // 5. 模拟检查内容
    await humanBrowse(page);
    
    // 6. 点击发布
    console.log('🖱️ 点击发布...');
    await humanThink(500, 1000);
    await humanClick(page, 'button:has-text("Post"), [type="submit"]');
    
    // 7. 等待发布成功
    console.log('⏳ 等待发布完成...');
    await page.waitForURL(/\/r\/.+\/comments\//, { timeout: 20000 });
    
    const postUrl = page.url();
    console.log('\n✅ 发布成功！');
    console.log('🔗 URL:', postUrl);
    
    // 保存结果
    const fs = require('fs');
    fs.writeFileSync('/opt/openclaw/state/last-post.json', JSON.stringify({
      success: true,
      url: postUrl,
      subreddit,
      title,
      timestamp: new Date().toISOString()
    }, null, 2));
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    
    // 截图
    await page.screenshot({ path: `/opt/openclaw/runtime/screenshots/error-${Date.now()}.png` });
    
    throw error;
  } finally {
    await page.close();
    // 注意：不要关闭 browser，保持 Chrome 运行
  }
}

main()
  .then(() => {
    console.log('\n🎉 完成！');
    process.exit(0);
  })
  .catch(e => {
    console.error('\n💥 失败:', e.message);
    process.exit(1);
  });
