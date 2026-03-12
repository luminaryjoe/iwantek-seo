// Reddit 发帖脚本 - 使用已保存的登录状态
const { chromium } = require('playwright');

async function createPost(subreddit, title, body) {
  console.log('🚀 启动浏览器...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  // 加载已保存的登录状态
  const context = await browser.newContext({
    storageState: 'reddit-auth.json',
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`📍 访问 r/${subreddit}...`);
    await page.goto(`https://www.reddit.com/r/${subreddit}/submit`);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 检查是否需要登录
    const loginButton = await page.locator('text=Log In').count();
    if (loginButton > 0) {
      throw new Error('登录状态已过期，请重新运行 reddit-login.js');
    }
    
    console.log('📝 填写标题...');
    // 语义定位：标题输入框
    const titleInput = await page.locator('[aria-label="Title"], [placeholder*="Title"], textarea[name="title"]').first();
    await titleInput.fill(title);
    
    console.log('📝 填写内容...');
    // 语义定位：内容输入框
    const bodyInput = await page.locator('[aria-label="Body"], [placeholder*="body"], textarea[name="body"], [contenteditable="true"]').first();
    await bodyInput.fill(body);
    
    console.log('⏳ 等待 3 秒...');
    await page.waitForTimeout(3000);
    
    console.log('🖱️ 点击发布按钮...');
    // 语义定位：发布按钮
    const submitButton = await page.locator('button:has-text("Post"), button:has-text("Submit"), [type="submit"]').first();
    
    // 检查按钮是否可用
    const isEnabled = await submitButton.isEnabled();
    if (!isEnabled) {
      throw new Error('发布按钮不可用，请检查表单是否填写完整');
    }
    
    await submitButton.click();
    
    // 等待发布成功（URL 变化）
    console.log('⏳ 等待发布成功...');
    await page.waitForURL(/\/r\/.+\/comments\//, { timeout: 15000 });
    
    const postUrl = page.url();
    console.log('\n✅ 帖子发布成功！');
    console.log('🔗 URL:', postUrl);
    
    // 保存结果
    const result = {
      success: true,
      url: postUrl,
      subreddit: subreddit,
      title: title,
      timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('last-post.json', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('\n❌ 发布失败:', error.message);
    
    // 截图保存
    const timestamp = Date.now();
    await page.screenshot({ path: `error-${timestamp}.png` });
    console.log(`📸 错误截图已保存: error-${timestamp}.png`);
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 主函数
(async () => {
  // 帖子内容
  const subreddit = 'CallCenterLife';
  const title = 'How I reduced headset costs by 40% without sacrificing quality';
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

  console.log('🎯 准备发布到 Reddit...');
  console.log(`📌 Subreddit: r/${subreddit}`);
  console.log(`📝 Title: ${title}`);
  console.log('\n⏳ 5 秒后开始...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const result = await createPost(subreddit, title, body);
    console.log('\n✅ 完成！');
    console.log('📊 结果已保存到 last-post.json');
  } catch (error) {
    console.error('\n💥 失败:', error.message);
    process.exit(1);
  }
})();
