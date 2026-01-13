# ✅ Vercel 部署检查清单

**目标**: 部署 PD Note 到 `prodentsupport.com`
**时间**: 约 30 分钟

---

## 📝 部署前准备 (5 分钟)

### ☐ 1. 生成 AUTH_SECRET
```bash
openssl rand -base64 32
```
**保存输出**: ________________________________

---

### ☐ 2. 准备账号
- [ ] Neon 账号 (https://neon.tech)
- [ ] Vercel 账号 (https://vercel.com)
- [ ] GitHub 账号 (已有: venokacode)

---

## 🗄️ 数据库设置 (5 分钟)

### ☐ 3. 创建 Neon 数据库
1. [ ] 访问 https://console.neon.tech
2. [ ] 点击 "Create Project"
3. [ ] 项目名称: `pdnote-production`
4. [ ] 选择区域: _____________ (建议 US East 或 Singapore)
5. [ ] 点击 "Create"

### ☐ 4. 获取数据库连接字符串
- [ ] 复制 **Pooled Connection String**
- [ ] 保存到记事本,格式:
  ```
  postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
  ```

**连接字符串**: ________________________________

---

## ☁️ Vercel 部署 (10 分钟)

### ☐ 5. 导入 GitHub 仓库
1. [ ] 访问 https://vercel.com/new
2. [ ] 使用 GitHub 登录
3. [ ] 选择仓库: `venokacode/ccnote`
4. [ ] 点击 "Import"

### ☐ 6. 配置项目设置
- [ ] Root Directory: `shipany-template-two`
- [ ] Framework: Next.js (自动检测)
- [ ] Build Command: `pnpm build`
- [ ] Install Command: `pnpm install --frozen-lockfile`

### ☐ 7. 配置环境变量 (重要!)

复制以下内容到 Vercel 环境变量:

```bash
NEXT_PUBLIC_APP_URL=https://prodentsupport.com
NEXT_PUBLIC_APP_NAME=PD Note
NEXT_PUBLIC_THEME=default
NEXT_PUBLIC_APPEARANCE=system
DATABASE_PROVIDER=postgresql
DATABASE_URL=[粘贴 Neon 连接字符串]
DB_SINGLETON_ENABLED=true
DB_MAX_CONNECTIONS=10
AUTH_SECRET=[粘贴生成的密钥]
NEXT_TELEMETRY_DISABLED=1
```

**检查**:
- [ ] 所有变量已填写
- [ ] DATABASE_URL 正确 (包含 ?sslmode=require)
- [ ] AUTH_SECRET 已替换

### ☐ 8. 开始部署
- [ ] 点击 "Deploy"
- [ ] 等待构建完成 (2-3 分钟)
- [ ] 记录 Vercel 预览地址: ________________________________

---

## 🌐 域名配置 (5 分钟)

### ☐ 9. 添加自定义域名
1. [ ] 在 Vercel Dashboard → Settings → Domains
2. [ ] 输入: `prodentsupport.com`
3. [ ] 点击 "Add"

### ☐ 10. 配置 DNS
Vercel 会显示需要添加的记录,选择以下方式之一:

**方式 A - Vercel Nameservers (推荐)**:
- [ ] 在域名注册商设置 nameservers:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ns3.vercel-dns.com
  ```

**方式 B - A 记录**:
- [ ] 添加 A 记录: @ → 76.76.21.21
- [ ] 添加 CNAME 记录: www → cname.vercel-dns.com

### ☐ 11. 等待 DNS 生效
- [ ] 使用 https://dnschecker.org 检查
- [ ] 通常需要 1-2 小时

---

## 🔧 数据库初始化 (3 分钟)

### ☐ 12. 在本地运行迁移
```bash
cd shipany-template-two
export DATABASE_URL="[粘贴 Neon 连接字符串]"
pnpm db:push
pnpm rbac:init
```

**验证**:
- [ ] db:push 成功执行
- [ ] rbac:init 成功执行

---

## 👤 管理员设置 (2 分钟)

### ☐ 13. 创建第一个用户
1. [ ] 访问: https://prodentsupport.com/sign-up
2. [ ] 填写信息:
   - Email: ________________________________
   - Password: ________________________________
   - Name: Admin

### ☐ 14. 分配管理员角色
```bash
export DATABASE_URL="[粘贴 Neon 连接字符串]"
pnpm rbac:assign
# 输入邮箱 → 选择 admin 角色
```

### ☐ 15. 验证管理员权限
- [ ] 访问: https://prodentsupport.com/admin
- [ ] 应该能看到管理后台

---

## ✅ 功能验证

### ☐ 16. 测试核心功能
- [ ] 网站可访问: https://prodentsupport.com
- [ ] SSL 证书正常 (绿色锁图标)
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 创建笔记功能
- [ ] 笔记保存到数据库
- [ ] 管理后台可访问
- [ ] 设置页面可保存

### ☐ 17. 检查性能
- [ ] 首页加载 < 3 秒
- [ ] 笔记创建 < 1 秒
- [ ] 无控制台错误

---

## 📧 可选配置

### ☐ 18. 邮件功能 (可选)
如需邮件功能,在 Vercel 环境变量添加:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@prodentshop.com
SMTP_PASSWORD=[Google App Password]
SMTP_FROM=noreply@prodentsupport.com
```

### ☐ 19. 分析工具 (可选)
在 Vercel Dashboard → Analytics 启用

---

## 🎉 部署完成!

### 最终验证清单:
- [ ] ✅ 网站运行正常
- [ ] ✅ 数据库连接正常
- [ ] ✅ 域名解析正确
- [ ] ✅ SSL 证书有效
- [ ] ✅ 管理员账户创建
- [ ] ✅ 所有核心功能正常

### 生产环境信息:
- 网站: https://prodentsupport.com
- 管理后台: https://prodentsupport.com/admin
- 支持邮箱: support@prodentshop.com

---

## 📝 部署记录

**部署日期**: _______________
**部署人员**: _______________
**Vercel 项目 ID**: _______________
**Neon 项目 ID**: _______________
**管理员邮箱**: _______________

**备注**:
_________________________________________
_________________________________________
_________________________________________

---

## 🔄 下一步

1. [ ] 配置邮件提醒功能
2. [ ] 设置备份策略
3. [ ] 配置监控告警
4. [ ] 培训团队使用系统
5. [ ] 准备用户文档

---

**问题反馈**: https://github.com/venokacode/ccnote/issues
**邮件支持**: support@prodentshop.com
