// Reddit 无头浏览器自动化脚本
const { chromium } = require('playwright');

// 启动参数 - 无头模式 + 反检测
const launchOptions = {
  headless: true,  // 无头模式
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-blink-features=AutomationControlled',
    '--window-size=1280,720'
  ]
};

// 创建 Reddit 自动化实例
class RedditHeadless {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init(authFile = 'reddit-auth.json') {
    console.log('🚀 启动无头浏览器...');
    
    this.browser = await chromium.launch(launchOptions);
    
    // 加载登录状态（如果存在）
    let contextOptions = {
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    if (require('fs').existsSync(authFile)) {
      console.log('📂 加载登录状态...');
      contextOptions.storageState = authFile;
    }
    
    this.context = await this.browser.newContext(contextOptions);
    
    // 反检测：禁用 webdriver 标记
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
    });
    
    this.page = await this.context.newPage();
    console.log('✅ 浏览器初始化完成');
  }

  // 检查是否已登录
  async checkLogin() {
    await this.page.goto('https://www.reddit.com');
    await this.page.waitForLoadState('networkidle');
    
    // 检查是否有用户菜单
    const userMenu = await this.page.locator('[aria-label="User menu"], [href*="/user/"]').count();
    
    if (userMenu > 0) {
      console.log('✅ 已登录');
      return true;
    } else {
      console.log('❌ 未登录');
      return false;
    }
  }

  // 登录（手动验证码版本）
  async login() {
    console.log('📍 打开登录页面...');
    await this.page.goto('https://www.reddit.com/login');
    await this.page.waitForLoadState('networkidle');
    
    // 截图保存当前状态
    await this.page.screenshot({ path: 'login-page.png' });
    console.log('📸 登录页面截图已保存: login-page.png');
    
    // 检查是否有 CAPTCHA
    const hasCaptcha = await this.page.locator('iframe[src*="captcha"], [aria-label*="captcha" i]').count();
    
    if (hasCaptcha > 0) {
      console.log('⚠️ 检测到 CAPTCHA，需要人工处理');
      console.log('👉 请查看 login-page.png 并完成验证');
      console.log('⏳ 完成后按 Enter 继续...');
      
      // 等待用户输入
      await new Promise(resolve => process.stdin.once('data', resolve));
    }
    
    console.log('💡 提示：请在浏览器中完成登录');
    console.log('（由于是无头模式，请使用有头模式首次登录）');
  }

  // 创建帖子
  async createPost(subreddit, title, body) {
    console.log(`\n🎯 准备发布到 r/${subreddit}...`);
    
    try {
      // 访问发帖页面
      await this.page.goto(`https://www.reddit.com/r/${subreddit}/submit`);
      await this.page.waitForLoadState('networkidle');
      
      // 检查是否需要登录
      const isLoggedIn = await this.checkLogin();
      if (!isLoggedIn) {
        throw new Error('未登录，请先运行登录流程');
      }
      
      console.log('📝 填写标题...');
      // 语义定位：标题输入框
      const titleInput = await this.page.locator('role=textbox[name*="Title" i], [placeholder*="Title" i]').first();
      await titleInput.fill(title);
      
      console.log('📝 填写内容...');
      // 语义定位：内容输入框
      const bodyInput = await this.page.locator('role=textbox[name*="Body" i], [contenteditable="true"]').first();
      await bodyInput.fill(body);
      
      // 随机延迟，模拟真人
      const delay = Math.floor(Math.random() * 2000) + 2000;
      console.log(`⏳ 等待 ${delay}ms...`);
      await this.page.waitForTimeout(delay);
      
      console.log('🖱️ 点击发布按钮...');
      // 语义定位：发布按钮
      const submitButton = await this.page.locator('role=button[name*="Post" i], button:has-text("Post")').first();
      
      // 检查按钮状态
      const isEnabled = await submitButton.isEnabled();
      if (!isEnabled) {
        throw new Error('发布按钮不可用');
      }
      
      await submitButton.click();
      
      // 等待发布成功
      console.log('⏳ 等待发布完成...');
      await this.page.waitForURL(/\/r\/.+\/comments\//, { timeout: 20000 });
      
      const postUrl = this.page.url();
      console.log('\n✅ 帖子发布成功！');
      console.log(`🔗 URL: ${postUrl}`);
      
      // 保存结果
      const result = {
        success: true,
        url: postUrl,
        subreddit: subreddit,
        title: title,
        timestamp: new Date().toISOString()
      };
      
      require('fs').writeFileSync('last-post.json', JSON.stringify(result, null, 2));
      
      // 截图保存
      await this.page.screenshot({ path: `success-${Date.now()}.png` });
      
      return result;
      
    } catch (error) {
      console.error('\n❌ 发布失败:', error.message);
      
      // 截图保存错误
      await this.page.screenshot({ path: `error-${Date.now()}.png` });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 保存登录状态
  async saveAuth() {
    await this.context.storageState({ path: 'reddit-auth.json' });
    console.log('💾 登录状态已保存');
  }

  // 关闭浏览器
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 浏览器已关闭');
    }
  }
}

// 主函数
async function main() {
  const reddit = new RedditHeadless();
  
  try {
    // 初始化
    await reddit.init();
    
    // 检查登录状态
    const isLoggedIn = await reddit.checkLogin();
    
    if (!isLoggedIn) {
      console.log('⚠️ 未检测到登录状态');
      console.log('💡 提示：首次使用需要在有头模式下登录');
      console.log('   运行: node reddit-login.js');
      await reddit.close();
      return;
    }
    
    // 发布帖子
    const result = await reddit.createPost(
      'CallCenterLife',
      'How I reduced headset costs by 40% without sacrificing quality',
      `I manage IT for a 150-agent call center. Six months ago, we were bleeding money on "premium" headsets that kept breaking.

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

(I consult with Wantek now, but this data convinced me to work with them.)`
    );
    
    if (result.success) {
      console.log('\n🎉 完成！');
    } else {
      console.log('\n💥 失败，请检查错误信息');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 错误:', error.message);
  } finally {
    await reddit.close();
  }
}

// 运行
main();
