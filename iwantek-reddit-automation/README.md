# Reddit 自动化发布完整方案

## 方案概述

由于 Reddit 登录需要 CAPTCHA，采用**本地登录 + 服务器发布**的混合方案。

## 文件说明

| 文件 | 用途 | 运行环境 |
|------|------|----------|
| `reddit-login.js` | 首次登录，保存 auth 状态 | 本地电脑（有头模式）|
| `reddit-headless.js` | 无头发布帖子 | 服务器（无头模式）|
| `reddit-post.js` | 有头发布（备用）| 本地电脑 |

---

## 快速开始

### 第一步：本地电脑登录

在你的本地电脑（有图形界面）执行：

```bash
# 1. 克隆仓库
git clone https://github.com/luminaryjoe/iwantek-seo.git
cd iwantek-seo/iwantek-reddit-automation

# 2. 安装依赖
npm install

# 3. 运行登录脚本
node reddit-login.js
```

**操作**：
- 浏览器自动打开 Reddit 登录页
- 输入用户名和密码
- 完成 CAPTCHA
- 登录成功后，按 Enter 键
- 生成 `reddit-auth.json` 文件

### 第二步：上传登录状态到服务器

```bash
# 上传 auth 文件到服务器
scp reddit-auth.json root@your-server:/root/.openclaw/workspace/iwantek-reddit-automation/
```

### 第三步：服务器自动发布

在服务器执行：

```bash
cd /root/.openclaw/workspace/iwantek-reddit-automation

# 运行无头发布
node reddit-headless.js
```

---

## 发布内容

脚本已预配置以下内容：

**标题**：
```
How I reduced headset costs by 40% without sacrificing quality
```

**内容**：
- 150 人呼叫中心的真实案例
- TCO 分析（总拥有成本）
- 40% 成本降低
- 70% IT 工单减少
- 明确 disclose 与 Wantek 的关系

**目标社区**：r/CallCenterLife

---

## 自定义内容

编辑 `reddit-headless.js`，修改以下部分：

```javascript
// 修改社区
const result = await reddit.createPost(
  'YourSubreddit',  // ← 修改这里
  'Your Title',     // ← 修改这里
  'Your content...' // ← 修改这里
);
```

---

## 定时发布

使用 cron 定时发布：

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天上午 10 点）
0 10 * * * cd /root/.openclaw/workspace/iwantek-reddit-automation && node reddit-headless.js >> /var/log/reddit-post.log 2>&1
```

---

## 故障排除

### 问题 1：登录状态过期

**现象**：提示 "未登录"

**解决**：
1. 重新在本地运行 `reddit-login.js`
2. 上传新的 `reddit-auth.json`

### 问题 2：发布失败

**现象**：错误截图显示元素找不到

**解决**：
- Reddit UI 可能更新，需要更新脚本
- 检查 `error-*.png` 截图

### 问题 3：被检测为机器人

**现象**：CAPTCHA 频繁出现

**解决**：
- 增加延迟时间
- 减少发布频率
- 使用住宅代理

---

## 安全建议

1. **定期更换 auth 文件**（每月）
2. **使用专用 Reddit 账号**（非个人账号）
3. **控制发布频率**（每天 1-2 帖）
4. **启用 2FA** 保护账号

---

## 文件位置

- 本地：`iwantek-reddit-automation/`
- 服务器：`/root/.openclaw/workspace/iwantek-reddit-automation/`
- GitHub：https://github.com/luminaryjoe/iwantek-seo

---

## 技术支持

如有问题，请检查：
1. `reddit-auth.json` 是否存在
2. 浏览器依赖是否安装
3. 错误截图 `error-*.png`
4. 发布日志 `last-post.json`
