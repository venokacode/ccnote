# 🌐 DNS 配置和验证指南

**域名**: prodentsupport.com
**目标**: Vercel 部署

---

## ⏱️ DNS 生效时间

### 预期时间
- **最快**: 5-15 分钟
- **通常**: 1-2 小时
- **最长**: 24-48 小时

### 影响因素
- DNS 提供商的传播速度
- TTL (Time To Live) 设置
- 全球 DNS 缓存更新速度
- 你的网络 DNS 缓存

---

## 🔧 DNS 配置步骤回顾

### 方式 1: Vercel Nameservers (推荐)

在你的域名注册商修改 Nameservers:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
```

**优点**:
- Vercel 自动管理所有 DNS 记录
- 自动配置 SSL
- 更快的传播速度
- 无需手动配置 A/CNAME 记录

**检查位置**:
- GoDaddy: Domain Settings → Nameservers
- Namecheap: Domain List → Manage → Nameservers
- Google Domains: DNS → Name servers
- Cloudflare: DNS → Nameservers

---

### 方式 2: A 记录 + CNAME

如果使用现有 DNS 提供商,添加:

**主域名 (A 记录)**:
```
Type: A
Name: @ (或留空)
Value: 76.76.21.21
TTL: 3600 (1 小时)
```

**WWW 子域名 (CNAME)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## ✅ DNS 验证工具

### 1. 在线 DNS 检查工具

#### DNSChecker.org (推荐)
https://dnschecker.org/

**使用方法**:
1. 输入: `prodentsupport.com`
2. 类型: 选择 `A`
3. 点击 "Search"
4. 查看全球各地的 DNS 解析结果

**期望结果**:
- 显示绿色勾号 ✓
- IP 地址: `76.76.21.21`
- 全球多个位置都显示相同 IP

---

#### WhatsmyDNS.net
https://www.whatsmydns.net/

**使用方法**:
1. 输入: `prodentsupport.com`
2. 类型: A
3. 查看世界地图上的解析状态

**期望结果**:
- 大部分位置显示绿色 ✓
- 解析到 `76.76.21.21`

---

### 2. 命令行验证

#### Windows (PowerShell/CMD)
```powershell
# 查询 A 记录
nslookup prodentsupport.com

# 期望输出:
# Name:    prodentsupport.com
# Address: 76.76.21.21

# 查询 CNAME 记录
nslookup www.prodentsupport.com

# 使用特定 DNS 服务器查询
nslookup prodentsupport.com 8.8.8.8  # Google DNS
nslookup prodentsupport.com 1.1.1.1  # Cloudflare DNS
```

#### macOS/Linux
```bash
# 使用 dig 命令
dig prodentsupport.com

# 简洁输出
dig +short prodentsupport.com
# 期望输出: 76.76.21.21

# 查询 www 子域名
dig www.prodentsupport.com

# 使用特定 DNS 服务器
dig @8.8.8.8 prodentsupport.com
dig @1.1.1.1 prodentsupport.com
```

---

### 3. 浏览器验证

#### 步骤 1: 清除本地 DNS 缓存

**Windows**:
```cmd
ipconfig /flushdns
```

**macOS**:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux**:
```bash
sudo systemd-resolve --flush-caches
```

#### 步骤 2: 访问网站
```
https://prodentsupport.com
```

**期望结果**:
- ✅ 网站正常加载
- ✅ 显示绿色锁图标 (SSL)
- ✅ 地址栏显示 `prodentsupport.com`

---

## 🔍 DNS 传播监控

### 持续监控脚本

**Windows (PowerShell)**:
```powershell
# 保存为 check-dns.ps1
while ($true) {
    Clear-Host
    Write-Host "=== DNS Check for prodentsupport.com ===" -ForegroundColor Green
    Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
    Write-Host ""

    # Google DNS
    Write-Host "Google DNS (8.8.8.8):" -ForegroundColor Cyan
    nslookup prodentsupport.com 8.8.8.8 | Select-String "Address"

    # Cloudflare DNS
    Write-Host "`nCloudflare DNS (1.1.1.1):" -ForegroundColor Cyan
    nslookup prodentsupport.com 1.1.1.1 | Select-String "Address"

    # Local DNS
    Write-Host "`nLocal DNS:" -ForegroundColor Cyan
    nslookup prodentsupport.com | Select-String "Address"

    Write-Host "`nChecking again in 60 seconds..." -ForegroundColor Gray
    Write-Host "Press Ctrl+C to stop"
    Start-Sleep -Seconds 60
}
```

运行:
```powershell
.\check-dns.ps1
```

---

**macOS/Linux (Bash)**:
```bash
#!/bin/bash
# 保存为 check-dns.sh

while true; do
    clear
    echo "=== DNS Check for prodentsupport.com ==="
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    echo "Google DNS (8.8.8.8):"
    dig @8.8.8.8 +short prodentsupport.com

    echo ""
    echo "Cloudflare DNS (1.1.1.1):"
    dig @1.1.1.1 +short prodentsupport.com

    echo ""
    echo "Local DNS:"
    dig +short prodentsupport.com

    echo ""
    echo "Checking again in 60 seconds..."
    echo "Press Ctrl+C to stop"
    sleep 60
done
```

运行:
```bash
chmod +x check-dns.sh
./check-dns.sh
```

---

## ⚠️ 常见问题排查

### 问题 1: DNS 长时间未生效 (超过 6 小时)

**可能原因**:
- Nameservers 配置错误
- 域名注册商未保存更改
- 域名被锁定

**解决方法**:
1. 登录域名注册商确认 Nameservers 已更新
2. 检查域名状态 (确保未锁定)
3. 联系域名注册商客服

---

### 问题 2: 部分地区可访问,部分不可访问

**原因**: DNS 传播过程中,正常现象

**解决方法**:
- 继续等待传播完成
- 使用不同 DNS 服务器测试
- 等待 24-48 小时

---

### 问题 3: 显示 "无法访问此网站" 或 DNS_PROBE_FINISHED_NXDOMAIN

**可能原因**:
- 本地 DNS 缓存未清除
- DNS 记录配置错误

**解决方法**:
```bash
# 1. 清除浏览器缓存
Chrome: chrome://net-internals/#dns → Clear host cache

# 2. 清除系统 DNS 缓存
Windows: ipconfig /flushdns
macOS: sudo dscacheutil -flushcache

# 3. 使用隐身/无痕模式访问
```

---

### 问题 4: SSL 证书错误

**原因**: Vercel 还在生成 SSL 证书

**解决方法**:
1. 等待 5-10 分钟
2. 在 Vercel Dashboard 检查域名状态
3. 如果超过 1 小时仍未生效,重新添加域名

---

## 📊 DNS 验证检查清单

### ☐ 基础验证
- [ ] Nameservers 已更新 (如使用 Vercel NS)
- [ ] A 记录已添加 (如使用现有 DNS)
- [ ] CNAME 记录已添加 (www 子域名)
- [ ] TTL 设置为 3600 或更小

### ☐ DNS 解析验证
- [ ] Google DNS (8.8.8.8) 解析正确
- [ ] Cloudflare DNS (1.1.1.1) 解析正确
- [ ] 本地 DNS 解析正确
- [ ] DNSChecker.org 显示全球大部分位置正确

### ☐ 网站访问验证
- [ ] https://prodentsupport.com 可访问
- [ ] https://www.prodentsupport.com 可访问 (如配置)
- [ ] SSL 证书有效 (绿色锁图标)
- [ ] 无安全警告

### ☐ Vercel 验证
- [ ] Vercel Dashboard 显示域名状态为 "Valid"
- [ ] SSL 证书状态为 "Issued"
- [ ] 无错误或警告

---

## 🎯 加速 DNS 生效的技巧

### 1. 降低 TTL
在更改 DNS 之前:
- 将 TTL 设置为 300 (5 分钟)
- 等待旧 TTL 过期
- 然后进行 DNS 更改

### 2. 使用 Vercel Nameservers
- 比 A 记录方式更快
- Vercel 优化的传播速度
- 自动管理所有配置

### 3. 清除各级缓存
```bash
# 清除本地缓存
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # macOS

# 清除浏览器缓存
Chrome → chrome://net-internals/#dns
```

---

## 📱 移动设备验证

### iOS
1. 设置 → Wi-Fi → (i) 图标
2. 配置 DNS → 手动
3. 添加 DNS: `8.8.8.8`, `1.1.1.1`
4. 访问 `https://prodentsupport.com`

### Android
1. 设置 → 网络和互联网 → Wi-Fi
2. 长按连接的网络 → 修改网络
3. 高级选项 → DNS 设置 → 静态
4. DNS 1: `8.8.8.8`, DNS 2: `1.1.1.1`
5. 访问 `https://prodentsupport.com`

---

## 🔔 DNS 生效通知

### 自动检查脚本 (带通知)

**PowerShell (Windows)**:
```powershell
$targetDomain = "prodentsupport.com"
$expectedIP = "76.76.21.21"

while ($true) {
    $result = (nslookup $targetDomain 8.8.8.8 2>&1 | Select-String "Address")

    if ($result -match $expectedIP) {
        Write-Host "✅ DNS is live! $targetDomain → $expectedIP" -ForegroundColor Green
        [System.Media.SystemSounds]::Asterisk.Play()
        break
    } else {
        Write-Host "⏳ DNS not ready yet. Checking again in 60s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
    }
}
```

---

## 📞 需要帮助?

### 域名注册商支持
- **GoDaddy**: https://www.godaddy.com/help
- **Namecheap**: https://www.namecheap.com/support
- **Google Domains**: https://support.google.com/domains

### Vercel 支持
- **文档**: https://vercel.com/docs/custom-domains
- **社区**: https://github.com/vercel/vercel/discussions
- **支持**: https://vercel.com/support

### 项目支持
- **GitHub Issues**: https://github.com/venokacode/ccnote/issues
- **邮件**: support@prodentshop.com

---

## ✅ DNS 生效后的下一步

一旦 DNS 生效:

1. [ ] 访问 https://prodentsupport.com 验证
2. [ ] 检查 SSL 证书状态
3. [ ] 测试注册/登录功能
4. [ ] 创建第一个管理员账户
5. [ ] 配置应用设置
6. [ ] 通知团队开始使用

---

**耐心等待 DNS 传播,通常 1-2 小时内会完成!** ⏱️

使用上述工具持续监控进度。
