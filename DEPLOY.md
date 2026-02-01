部署说明 (简单，适用于 GitHub Pages 仓库 `ZHANGXiyuan2004.github.io`)：

1. 将新文件添加并提交到主分支（`main` / `master`，取决于你的仓库默认分支）：

```bash
git add .
git commit -m "Add website pages and styles"
git push origin main
```

2. 对于仓库名为 `<username>.github.io` 的仓库，GitHub 会自动把 `main`（或默认分支）的内容当作静态网站并发布，站点地址通常为：

https://ZHANGXiyuan2004.github.io

3. 如果你使用其他仓库名，请在 GitHub 仓库设置 -> Pages 中选择分支并启用 Pages。

备注：第一次推送后，生效可能需要 30s~2min。若要自动化或发布到 `gh-pages` 分支，可添加 GitHub Actions 流程（可按需添加）。