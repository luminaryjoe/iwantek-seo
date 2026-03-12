// Reddit 登录脚本 - 保存登录状态
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动浏览器...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 访问 Reddit 登录页
  console.log('📍 访问 Reddit 登录页面...');
  await page.goto('https://www.reddit.com/login');
  
  console.log('\n✅ 浏览器已打开');
  console.log('👉 请在浏览器中完成以下操作：');
  console.log('   1. 输入 Reddit 用户名和密码');
  console.log('   2. 完成 CAPTCHA（如果出现）');
  console.log('   3. 完成登录');
  console.log('\n⏳ 登录成功后，按 Enter 键保存登录状态...');
  
  // 等待用户输入
  process.stdin.once('data', async () => {
    try {
      // 保存登录状态
      await context.storageState({ path: 'reddit-auth.json' });
      console.log('\n✅ 登录状态已保存到 reddit-auth.json');
      console.log('📝 可以运行发布脚本了');
    } catch (error) {
      console.error('❌ 保存失败:', error.message);
    } finally {
      await browser.close();
      process.exit(0);
    }
  });
})();
