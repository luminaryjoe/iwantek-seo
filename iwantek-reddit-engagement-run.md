# Reddit Engagement 技能运行指南

## 技能信息

✅ **reddit-engagement** (v1.0.0) - 已安装

### 核心特点
- 使用浏览器可访问性树语义（Accessibility Tree）
- 不依赖脆弱的 DOM id/CSS 选择器
- 支持 UI 变化、A/B 测试、本地化差异
- 高成功率 across UI changes

---

## 工作原理

### 语义定位（Semantic Targeting）

**高优先级信号**：
1. ✅ 可访问角色 + 名称精确匹配（如：button "Post"）
2. ✅ 可访问名称同义词匹配（如："Submit", "Reply", "Send"）
3. ✅ 相对上下文锚点（在 composer 区域内）
4. ✅ 可见性和启用状态检查

**绝不依赖**：
- ❌ 硬编码 CSS 选择器
- ❌ 硬编码 DOM id/class
- ❌ 绝对 XPath
- ❌ 静态子索引路径

### 可靠性循环（Universal Reliability Loop）

```
1. 快照当前页面（aria refs）
2. 通过语义线索解析目标
3. 评分候选元素
4. 执行操作
5. 验证结果
6. 失败则回滚重试（最多3次）
```

---

## 需要的配置文件

### 1. PERSONA.md（个人资料）

位置：`/root/.openclaw/workspace/PERSONA.md`

内容模板：
```markdown
# Persona Facts

## 真实个人经历
- 管理 150 人呼叫中心的 IT
- 5+ 年设备部署经验
- 测试过 20+ 款耳机
- 实际部署过 500+ 台 Wantek 设备

## 专业背景
- IT 管理员
- 呼叫中心设备顾问
- 成本优化专家

## 已使用的故事/内容记录
| 日期 | 平台 | 内容摘要 | 使用事实 |
|------|------|----------|----------|
| 2024-03-12 | Reddit | TCO 分析帖子 | 150 人中心数据 |
```

### 2. references/post-strategy.md（发帖策略）

已存在，包含：
- Subreddit 文化档案
- 反 AI 写作规则
- 内容角度选择
- 互动钩子

### 3. references/sub-archives.md（社区档案）

需要添加 CallCenterLife 档案：
```markdown
## r/CallCenterLife

| Field | Value |
|-------|-------|
| **Members** | 45K |
| **Posting Threshold** | Low-Medium |
| **AI Detection** | Medium |
| **Language** | English |
| **Tone** | Professional, practical |
| **Self-promo** | Allowed with disclosure |

### Top 3 Rules
1. Be respectful to agents and managers
2. No spam or excessive self-promotion
3. Disclose commercial relationships

### What Works
- Data-driven analysis
- Real experience stories
- Cost optimization tips
- Equipment comparisons

### Title Patterns
- "How I..."
- "What I learned..."
- "The real cost of..."
- Numbers and percentages

### Notes
- Very receptive to TCO analysis
- Appreciates specific numbers
- Dislikes marketing speak
- Values authenticity
```

---

## 创建帖子流程

### 完整步骤

**Step 1: 内容生成（Strategy Layer）**
```
1. 识别目标 subreddit: CallCenterLife
2. 加载社区档案: references/sub-archives.md
3. 选择内容角度: Story/Journey
4. 加载个人资料: PERSONA.md
5. 应用反 AI 规则
6. 起草内容
7. 添加互动钩子
8. 制作标题
9. 用户确认
```

**Step 2: 浏览器自动化（Interaction Layer）**
```
1. 导航到 subreddit URL: /r/CallCenterLife
2. 快照页面 (refs=aria)
3. 找到发帖入口: "Create post" / "Create" / "Post"
4. 打开 composer 并重新快照
5. 填写标题字段 (role textbox, name includes "Title")
6. 填写内容字段 (textbox/editor "Body", "Text", "Post body")
7. 验证提交按钮: {"Post", "Submit", "Publish"} 且 enabled
8. 点击提交
9. 验证成功:
   - 帖子详情页打开
   - 新帖子标题可见
   - 成功 toast/banner
```

**Step 3: 记录使用**
```
更新 PERSONA.md "已使用内容登记" 表
```

---

## 反 AI 写作规则

### 禁用短语（BANNED）
- ❌ game-changing
- ❌ revolutionary
- ❌ excited to share
- ❌ thrilled to announce
- ❌ innovative
- ❌ disruptive
- ❌ passionate about
- ❌ leveraging
- ❌ seamless
- ❌ robust
- ❌ cutting-edge

### 必需人类模式（REQUIRED）
- ✅ 缩写（I'm, it's, don't）
- ✅ 犹豫表达（"I think", "might", "probably"）
- ✅ 具体失败经历
- ✅ 近似数字（"~200 users", "about 3 months"）
- ✅ 非正式语气

---

## 质量检查（Quality Gate）

### 5 维度评分（1-5）

| 维度 | 检查点 | 重写条件 |
|------|--------|----------|
| **Authenticity** | 像真人，不像营销 | < 3 |
| **Value-first** | 不点击链接也有收获 | < 3 |
| **Transparency** | 清楚说明产品关系 | < 3 |
| **Specificity** | 具体数字、日期、细节 | < 3 |
| **CTA quality** | 真诚的问题结尾 | < 3 |

---

## 实际运行示例

### 示例 1: 创建帖子

**用户请求**: "在 r/CallCenterLife 发帖关于 Wantek H600"

**执行流程**:
```
1. 识别模糊请求 → 执行内容生成
2. 加载 r/CallCenterLife 档案
3. 选择角度: Story/Journey
4. 生成标题: "How I reduced headset costs by 40% without sacrificing quality"
5. 生成内容（包含 PERSONA.md 中的真实数据）
6. 应用反 AI 规则
7. 用户确认
8. 浏览器自动化发布
9. 记录使用
```

**生成的帖子**:
```markdown
标题: How I reduced headset costs by 40% without sacrificing quality

内容:
I manage IT for a 150-agent call center. Six months ago, we were bleeding money on "premium" headsets that kept breaking.

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

(I consult with Wantek now, but this data convinced me to work with them.)
```

### 示例 2: 创建评论

**用户请求**: "回复这个帖子，有人问无线耳机"

**执行流程**:
```
1. 读取目标帖子/评论
2. 检查 subreddit 信息
3. 加载评论策略
4. 加载 PERSONA.md
5. 应用反 AI 规则
6. 生成评论（提供信息增量，不只是"+1"）
7. 用户确认
8. 浏览器自动化发布
9. 记录使用
```

**生成的评论**:
```
Good question! We tested wireless but found:
- Battery life: 15 hours (not enough for 8+ hour shifts)
- Cost: $150 vs $45 for USB
- For agents at desks, USB won. For supervisors who move around, wireless was worth it.

What's your use case?
```

---

## 故障排除

### 常见错误

| 错误 | 恢复方法 |
|------|----------|
| Login wall / CAPTCHA | 暂停，要求用户完成挑战，从最新快照恢复 |
| Button exists but disabled | 检查缺失必填字段或速率限制 |
| Multiple matching buttons | 选择最近语义容器内的候选（composer/action row）|
| UI redesign | 依赖 role/name/context 回退链 |
| Subreddit 发帖受限 | 返回限制原因，要求替代 subreddit |

### 提交安全门

点击最终提交前：
1. 回显目标摘要：subreddit/post URL/action/content preview
2. 确保必填字段非空且在 Reddit 限制内
3. 确认账号/会话已认证
4. 确认无阻止验证/错误可见

---

## 与 reddit-assistant 的区别

| 功能 | reddit-assistant | reddit-engagement |
|------|------------------|-------------------|
| 内容生成 | ✅ 优秀 | ✅ 优秀（相同）|
| 浏览器自动化 | ❌ 无 | ✅ 完整 |
| API 依赖 | 需要 Reddit API | 浏览器直接操作 |
| 反检测 | 一般 | 优秀（语义定位）|
| 可靠性 | 依赖 API 稳定性 | 更稳定（语义定位）|
| 使用场景 | 内容创作 | 实际发布操作 |

---

## 推荐使用流程

### 完整工作流

```
reddit-assistant
    ↓ 生成高质量内容
reddit-engagement
    ↓ 浏览器自动化发布
reddit-insights（可选）
    ↓ 监控效果和回复
```

### 具体步骤

1. **使用 reddit-assistant 生成内容**
   - 3 个帖子角度
   - 质量评分
   - 社区分析

2. **使用 reddit-engagement 发布**
   - 浏览器自动化
   - 语义定位
   - 实际提交

3. **手动回复评论**（推荐）
   - 使用生成的回复模板
   - 保持真实互动

---

## 当前状态

### 已准备
- ✅ reddit-engagement 技能已安装
- ✅ 参考文件已存在
- ✅ 互动模式已定义

### 需要配置
- ⚠️ PERSONA.md（个人资料文件）
- ⚠️ sub-archives.md（需要添加 CallCenterLife）
- ⚠️ 浏览器环境（用于实际自动化）

### 下一步
1. 创建 PERSONA.md
2. 更新 sub-archives.md
3. 配置浏览器环境
4. 执行实际发布

---

## 文件位置

- 技能目录：`/root/.openclaw/workspace/skills/reddit-engagement/`
- 参考文件：`references/`
- 使用指南：`iwantek-reddit-engagement-run.md`

---

**准备好配置 PERSONA.md 和浏览器环境后，即可开始实际发布！**
