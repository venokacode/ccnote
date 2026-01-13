# 🧪 DNS 生效前的测试方案

**目的**: 在域名 DNS 生效前先测试部署是否成功

---

## 🌐 使用 Vercel 临时域名

### 1. 获取 Vercel 自动分配的域名

部署完成后,Vercel 会自动分配一个临时域名:

**格式**:
```
https://[project-name]-[random-hash]-[team-name].vercel.app
```

**示例**:
```
https://ccnote-abc123def-venokacode.vercel.app
```

### 2. 查找你的 Vercel 域名

#### 方法 1: Vercel Dashboard
1. 访问 https://vercel.com/dashboard
2. 点击你的项目
3. 在项目页面顶部会显示域名
4. 复制 `.vercel.app` 域名

#### 方法 2: 部署完成邮件
Vercel 会发送部署成功邮件,包含:
- Production URL
- Deployment URL
- 直接访问链接

#### 方法 3: CLI
```bash
vercel ls
# 会列出所有项目的域名
```

---

## ✅ 完整功能测试清单

使用 Vercel 临时域名进行测试:

### 1. 基础访问测试
- [ ] 访问主页: `https://[your-project].vercel.app`
- [ ] 页面正常加载
- [ ] 无 JavaScript 错误 (F12 查看控制台)
- [ ] 所有静态资源加载正常

---

### 2. 数据库连接测试

#### 测试方法:
访问注册页面并尝试创建账户

```
https://[your-project].vercel.app/sign-up
```

**测试步骤**:
1. [ ] 填写邮箱: test@example.com
2. [ ] 填写密码: Test123456!
3. [ ] 填写姓名: Test User
4. [ ] 点击 "Sign Up"

**期望结果**:
- ✅ 账户创建成功
- ✅ 自动跳转或显示成功消息
- ❌ 如果失败,检查数据库配置

**常见错误**:
```
Error: connect ETIMEDOUT
→ 数据库连接超时,检查 DATABASE_URL

Error: Invalid connection string
→ 连接字符串格式错误

Error: SSL required
→ 缺少 ?sslmode=require 参数
```

---

### 3. 认证功能测试

#### 测试登录:
```
https://[your-project].vercel.app/sign-in
```

1. [ ] 使用刚注册的账户登录
2. [ ] 输入邮箱和密码
3. [ ] 点击 "Sign In"

**期望结果**:
- ✅ 登录成功
- ✅ 跳转到主页或仪表板
- ✅ 显示用户信息

---

### 4. 核心功能测试

#### 创建笔记:
```
https://[your-project].vercel.app/notes
```

1. [ ] 点击 "+" 按钮
2. [ ] 选择笔记类型
3. [ ] 填写标题和内容
4. [ ] 保存笔记

**期望结果**:
- ✅ 笔记显示在画布上
- ✅ 刷新页面后笔记仍然存在 (数据库持久化)
- ✅ 可以拖动和编辑笔记

---

### 5. 管理后台测试

**⚠️ 注意**: 需要先分配管理员角色

#### 步骤 1: 分配管理员角色 (本地运行)
```bash
cd shipany-template-two
export DATABASE_URL="[你的Neon连接字符串]"
pnpm rbac:assign
# 输入注册的邮箱
# 选择 admin 角色
```

#### 步骤 2: 访问管理后台
```
https://[your-project].vercel.app/admin
```

**测试清单**:
- [ ] 可以访问管理后台
- [ ] 能看到仪表板
- [ ] 可以访问设置页面
- [ ] 可以修改并保存设置

---

## 🔍 日志和调试

### 1. 查看 Vercel 部署日志

```bash
# 安装 Vercel CLI (如果还没有)
npm i -g vercel

# 登录
vercel login

# 查看日志
vercel logs [your-project].vercel.app
```

### 2. 查看实时日志

访问 Vercel Dashboard:
1. 进入项目
2. 点击 "Deployments"
3. 选择最新部署
4. 点击 "View Function Logs"

### 3. 浏览器控制台

按 F12 打开开发者工具:
- **Console**: 查看 JavaScript 错误
- **Network**: 查看 API 请求状态
- **Application**: 查看 Cookies 和 LocalStorage

---

## 🐛 常见问题排查

### 问题 1: 500 Internal Server Error

**可能原因**:
- 数据库连接失败
- 环境变量未配置

**排查步骤**:
1. 检查 Vercel 环境变量
2. 验证 DATABASE_URL 格式
3. 查看 Function Logs

**解决方法**:
```bash
# 在 Vercel Dashboard 中验证环境变量
Project → Settings → Environment Variables

# 确保包含:
DATABASE_URL=postgresql://...?sslmode=require
AUTH_SECRET=your-secret
NEXT_PUBLIC_APP_URL=https://[your-project].vercel.app
```

---

### 问题 2: 注册/登录失败

**错误信息**: "Failed to fetch" 或 "Network error"

**排查**:
1. 打开浏览器 F12 → Network
2. 查看失败的请求
3. 检查响应内容

**常见原因**:
- AUTH_SECRET 未配置或错误
- 数据库表未创建

**解决**:
```bash
# 确保已运行数据库迁移
export DATABASE_URL="your-neon-url"
pnpm db:push
pnpm rbac:init
```

---

### 问题 3: 页面白屏

**排查**:
1. F12 → Console 查看错误
2. 检查 Network 标签页的请求
3. 查看 Vercel Function Logs

**常见原因**:
- 构建错误
- 客户端 JavaScript 错误

---

## 📊 性能测试

### 1. 页面加载速度

使用浏览器开发者工具:
1. F12 → Network
2. 勾选 "Disable cache"
3. 刷新页面
4. 查看 "Load" 时间

**期望结果**:
- 首页加载 < 3 秒
- 后续页面 < 1 秒

### 2. Lighthouse 测试

1. F12 → Lighthouse
2. 选择 "Performance", "Accessibility", "SEO"
3. 点击 "Generate report"

**期望分数**:
- Performance: > 80
- Accessibility: > 90
- SEO: > 90

---

## 🔄 模拟真实域名访问

### 方法 1: 修改 Hosts 文件 (高级)

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**macOS/Linux**: `/etc/hosts`

添加:
```
76.76.21.21 prodentsupport.com
```

保存后访问: `http://prodentsupport.com`

**⚠️ 注意**:
- 需要管理员权限
- DNS 生效后记得删除此行
- 仅在本地生效

---

### 方法 2: 浏览器扩展

使用 Chrome 扩展:
- **ModHeader**: 修改请求头
- **Requestly**: 重定向规则

---

## ✅ 测试完成检查清单

在 DNS 生效前,确保以下都通过测试:

- [ ] ✅ Vercel 临时域名可访问
- [ ] ✅ 用户注册功能正常
- [ ] ✅ 用户登录功能正常
- [ ] ✅ 数据库读写正常
- [ ] ✅ 笔记创建和保存功能正常
- [ ] ✅ 管理后台可访问 (管理员)
- [ ] ✅ 设置页面可保存
- [ ] ✅ 无控制台错误
- [ ] ✅ 页面加载速度正常
- [ ] ✅ SSL 证书有效

---

## 📝 测试记录

**测试日期**: ________________
**Vercel 域名**: ________________
**测试人员**: ________________

### 功能测试结果:
- 注册: ☐ 通过 ☐ 失败
- 登录: ☐ 通过 ☐ 失败
- 创建笔记: ☐ 通过 ☐ 失败
- 管理后台: ☐ 通过 ☐ 失败
- 设置保存: ☐ 通过 ☐ 失败

### 发现的问题:
1. ________________________________
2. ________________________________
3. ________________________________

### 解决方案:
1. ________________________________
2. ________________________________
3. ________________________________

---

## 🎯 DNS 生效后的操作

当 `prodentsupport.com` DNS 生效后:

1. [ ] 更新 Vercel 环境变量中的 `NEXT_PUBLIC_APP_URL`
   ```
   从: https://[project].vercel.app
   改为: https://prodentsupport.com
   ```

2. [ ] 重新部署 (Vercel 会自动触发)

3. [ ] 使用新域名重新测试所有功能

4. [ ] 通知团队使用新域名

---

**在等待 DNS 生效期间,使用 Vercel 临时域名充分测试所有功能!** 🧪

这样 DNS 生效后,可以立即切换到正式域名,无需额外测试。
