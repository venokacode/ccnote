# 🚀 Vercel + Neon 部署指南

部署到生产环境: **prodentsupport.com**

---

## 📋 部署前准备

### 1. 生成 AUTH_SECRET
```bash
# 在命令行运行以下命令生成密钥
openssl rand -base64 32
```
**保存这个密钥,稍后会用到!**

---

## 🗄️ 第一步: 设置 Neon 数据库

### 1. 创建 Neon 账户
访问: https://neon.tech
- 使用 GitHub 或 Google 账号登录
- 免费套餐包含 0.5GB 存储空间

### 2. 创建新项目
1. 点击 **"Create Project"**
2. 项目设置:
   - **Project name**: `pdnote-production`
   - **Region**: 选择离你最近的区域 (建议 US East 或 Singapore)
   - **PostgreSQL version**: 16 (默认)
3. 点击 **"Create Project"**

### 3. 获取数据库连接字符串
创建完成后,你会看到连接信息:

```
Connection String (Pooled):
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**重要**:
- 复制 **Pooled connection string** (带 `-pooler` 的那个)
- Vercel 推荐使用 Pooled 连接,性能更好
- 保存这个连接字符串!

### 4. (可选) 通过 Neon Console 测试
1. 在 Neon Dashboard 点击 **"SQL Editor"**
2. 测试连接:
```sql
SELECT version();
```
看到 PostgreSQL 版本信息即表示连接成功

---

## ☁️ 第二步: 部署到 Vercel

### 方式 1: 通过 Vercel Dashboard (推荐,最简单)

#### 1. 导入 GitHub 仓库
1. 访问: https://vercel.com/new
2. 使用 GitHub 登录
3. 点击 **"Import Git Repository"**
4. 搜索并选择: `venokacode/ccnote`
5. 点击 **"Import"**

#### 2. 配置项目
- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `shipany-template-two`
- **Build Command**: `pnpm build` (保持默认)
- **Output Directory**: `.next` (保持默认)
- **Install Command**: `pnpm install --frozen-lockfile`

#### 3. 配置环境变量 (重要!)
点击 **"Environment Variables"**,添加以下变量:

```bash
# 应用基础配置
NEXT_PUBLIC_APP_URL=https://prodentsupport.com
NEXT_PUBLIC_APP_NAME=PD Note
NEXT_PUBLIC_THEME=default
NEXT_PUBLIC_APPEARANCE=system

# 数据库 (使用 Neon Pooled 连接字符串)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
DB_SINGLETON_ENABLED=true
DB_MAX_CONNECTIONS=10

# 认证 (使用之前生成的密钥)
AUTH_SECRET=your-generated-secret-here

# 邮件配置 (可选,先跳过)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=support@prodentshop.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@prodentsupport.com
```

#### 4. 部署
1. 点击 **"Deploy"**
2. 等待构建完成 (大约 2-3 分钟)
3. 部署成功后会显示预览链接

---

### 方式 2: 通过 Vercel CLI (高级用户)

#### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 配置环境变量
创建 `.env.production.local` 文件:
```bash
cd shipany-template-two
cp .env.example .env.production.local
```

编辑 `.env.production.local`,填入上面的环境变量。

#### 4. 部署
```bash
vercel --prod
```

按照提示操作:
- 选择 scope (你的账户)
- 链接到现有项目或创建新项目
- 等待部署完成

---

## 🌐 第三步: 配置域名 prodentsupport.com

### 1. 在 Vercel 中添加域名
1. 进入 Vercel Dashboard → 你的项目
2. 点击 **"Settings"** → **"Domains"**
3. 输入: `prodentsupport.com`
4. 点击 **"Add"**

Vercel 会显示需要配置的 DNS 记录。

### 2. 配置 DNS (在你的域名注册商)

#### A. 如果使用 Vercel Nameservers (推荐)
1. Vercel 会提供 3 个 nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ```
2. 在你的域名注册商(如 GoDaddy, Namecheap)设置这些 nameservers
3. 等待 DNS 传播 (最多 48 小时,通常 1-2 小时)

#### B. 如果使用现有 DNS 提供商
添加以下记录:

**A 记录 (IPv4)**:
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME 记录 (www 子域名)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. 等待 SSL 证书生成
- Vercel 会自动为你的域名生成免费的 Let's Encrypt SSL 证书
- 通常需要 1-5 分钟
- 完成后访问 `https://prodentsupport.com` 即可

---

## 🔧 第四步: 初始化数据库

### 1. 在本地运行迁移 (推荐)

```bash
cd shipany-template-two

# 设置数据库 URL
export DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# 运行数据库迁移
pnpm db:push

# 初始化 RBAC 角色
pnpm rbac:init
```

### 2. 或者在 Vercel 中运行 (通过 Function)

创建一个临时的 API route:

**`src/app/api/admin/setup-db/route.ts`**:
```typescript
import { db } from '@/core/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Run your migrations here
    // This is a one-time setup endpoint

    return NextResponse.json({
      success: true,
      message: 'Database initialized'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
```

访问: `https://prodentsupport.com/api/admin/setup-db`

**⚠️ 重要**: 初始化后立即删除这个文件!

---

## 👤 第五步: 创建管理员账户

### 1. 注册第一个用户
访问: https://prodentsupport.com/sign-up

填写:
- Email: admin@prodentshop.com (或你的邮箱)
- Password: 设置强密码
- Name: Admin

### 2. 分配管理员角色

在本地运行:
```bash
cd shipany-template-two

# 设置数据库 URL
export DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb"

# 分配管理员角色
pnpm rbac:assign
# 输入邮箱: admin@prodentshop.com
# 选择角色: admin
```

### 3. 验证管理员权限
访问: https://prodentsupport.com/admin/settings

应该能够看到管理后台!

---

## ⚙️ 第六步: 配置应用设置

### 1. 登录管理后台
https://prodentsupport.com/admin/settings

### 2. 配置关键设置

#### General (常规设置)
- App Name: PD Note
- App URL: https://prodentsupport.com

#### Email (邮件设置) - 如需邮件功能
- SMTP Host: smtp.gmail.com
- SMTP Port: 587
- SMTP User: support@prodentshop.com
- SMTP Password: (Google App Password)
- From Email: noreply@prodentsupport.com

#### Payment (支付设置) - 如需支付功能
- 配置 Stripe 或 PayPal

---

## ✅ 部署验证清单

完成后请验证以下功能:

- [ ] 网站可访问: https://prodentsupport.com
- [ ] SSL 证书正常 (显示绿色锁图标)
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 创建笔记功能正常
- [ ] 管理后台可访问: https://prodentsupport.com/admin
- [ ] 设置页面可访问且可保存
- [ ] 数据库连接正常 (笔记能够保存和读取)

---

## 📊 监控和维护

### 1. Vercel Analytics
在 Vercel Dashboard 中启用 Analytics:
- 访问: Project → Analytics
- 查看访问量、性能指标等

### 2. Neon Monitoring
在 Neon Dashboard 中查看:
- Database size
- Connection count
- Query performance

### 3. 查看日志
```bash
# Vercel 部署日志
vercel logs prodentsupport.com

# 或在 Dashboard 中查看
# Project → Deployments → [选择部署] → View Function Logs
```

---

## 🔄 更新部署

### 自动部署 (推荐)
当你推送代码到 GitHub main 分支时,Vercel 会自动:
1. 检测到更改
2. 运行构建
3. 部署到生产环境

### 手动部署
```bash
cd shipany-template-two
git push origin main  # Vercel 会自动检测并部署
```

### 回滚版本
1. 访问 Vercel Dashboard → Deployments
2. 找到之前的部署
3. 点击 **"Promote to Production"**

---

## 🐛 常见问题

### 1. 构建失败
**错误**: `Error: Could not find a production build`

**解决**:
1. 检查 `vercel.json` 中的 build 配置
2. 确保 Root Directory 设置为 `shipany-template-two`

### 2. 数据库连接错误
**错误**: `Error: connect ETIMEDOUT`

**解决**:
1. 检查 `DATABASE_URL` 是否正确
2. 确保使用 Neon 的 **Pooled connection**
3. 在 Vercel 环境变量中添加: `DB_SINGLETON_ENABLED=true`

### 3. 域名未生效
**解决**:
1. 等待 DNS 传播 (最多 48 小时)
2. 使用 https://dnschecker.org 检查 DNS 记录
3. 清除浏览器缓存

### 4. SSL 证书问题
**解决**:
- Vercel 会自动处理,等待 5-10 分钟
- 如果超过 1 小时还未生效,联系 Vercel 支持

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Neon 文档**: https://neon.tech/docs
- **项目 Issues**: https://github.com/venokacode/ccnote/issues
- **邮件支持**: support@prodentshop.com

---

## 🎉 完成!

恭喜! 你的 PD Note 应用现在已经部署到生产环境:

**🌐 网站地址**: https://prodentsupport.com
**⚙️ 管理后台**: https://prodentsupport.com/admin
**📧 支持邮箱**: support@prodentshop.com

开始使用你的便签管理系统吧! 🚀
