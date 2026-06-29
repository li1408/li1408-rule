# li1408

这是 140 的个人博客项目，基于 Astrofy 模板二次修改。

博客主要用来记录三类内容：

- 个人研究记录：从一个问题开始，记录查资料、试工具、部署、踩坑和复盘的过程。
- 电脑经验分享：整理 Windows、浏览器、GitHub、Cloudflare、AI 工具等实际使用经验。
- kli1408 的心理历程：记录一些改变想法和生活节奏的节点，不只写结果，也写当时的心理变化。

## 本地预览

推荐使用项目内脚本，缓存和工具目录会尽量放在工作目录内：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\dev-local.ps1
```

然后打开：

```text
http://127.0.0.1:4321/
```

## 构建

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-local.ps1
```

构建产物会输出到：

```text
dist/
```

## 部署计划

前期使用 Cloudflare Pages 自动部署：

- GitHub 仓库：`li1408/li1408-rule`
- 构建命令：`pnpm run build`
- 输出目录：`dist`
- 生产分支：`main`

后期再绑定自己的正式域名。

## 致谢

本项目基于 [Astrofy](https://github.com/manuelernestog/astrofy) 模板修改。
