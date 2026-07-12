# 🎰 一掷千金 — Deal or No Deal

仿美国真人秀节目《一掷千金》(Deal or No Deal) 的网页游戏。

## 🎮 游戏规则

- 26 个箱子，随机装着 $0.01 ~ $1,000,000 的金额
- 选择一个箱子作为你的箱子（之后会被提到上方单独展示）
- 按轮次打开其他箱子，每轮需要打开指定数量
- 每轮结束后，银行家根据剩余金额报价
- 你可以选择 DEAL（接受报价）或 NO DEAL（继续游戏）
- **每局有一次讨价还价的机会**，可以跟银行家抬价
- 坚持到最后就打开你的箱子拿走里面的钱

## 🚀 本地运行

```bash
# 用 Python 启动一个简单的 HTTP 服务器
python3 -m http.server 8080
```

浏览器打开 http://localhost:8080 即可游玩。

## 🌐 部署到公网

### 方案 A：GitHub Pages（免费，推荐）

```bash
# 在 GitHub 上创建仓库，然后：
git init
git add .
git commit -m "init"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

在仓库设置中开启 GitHub Pages（Settings → Pages → 选择 main 分支），几分钟后就能通过 `https://<用户名>.github.io/<仓库名>` 访问。

### 方案 B：Vercel（免费，一键部署）

1. 访问 https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 框架选 "Other"，一路 Next
4. 部署完成后会自动获得一个 `.vercel.app` 域名

### 方案 C：局域网分享

```bash
# 获取你的局域网 IP
ipconfig getifaddr en0
# 启动服务器
python3 -m http.server 8080
# 其他人在同一 Wi-Fi 下访问 http://<你的IP>:8080
```

## 📁 项目结构

```
index.html    ← 完整游戏（HTML + CSS + JS 全在一文件）
README.md     ← 本文件
```

> 整个游戏就是一个 HTML 文件，无需任何依赖，放到任意静态服务器即可运行。
