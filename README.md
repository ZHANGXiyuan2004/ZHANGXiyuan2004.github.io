# 张晰元 / Shine Yuan 个人主页

新版为中英双语的黑白简约主页，照片保持彩色。板块顺序：About → Research → 开源社区 → 自媒体与产品 → 兴趣爱好 → 联系方式。

技术栈：Next.js 16 静态导出、React 19、TypeScript、Tailwind CSS 4、Motion、Animate UI 官方源码组件。组件来源和适配见 [docs/ANIMATE_UI.md](docs/ANIMATE_UI.md)。

## 本地运行

需要 Node.js 20.9+（推荐 22）与 npm。

```bash
npm ci
npm run dev
```

打开 http://127.0.0.1:3000 。生产版验证：

```bash
npm run build
npm run preview
```

打开 http://127.0.0.1:8765 。macOS 也可双击 `open-local.command`；Windows 使用 `open-local.bat`。启动脚本会先构建新页面，再以 HTTP 服务 `out/`。

## 编辑

- `HOMEPAGE_EDIT.md`：供人修改的中英内容与动画说明，修改后由助手同步到代码，并非自动渲染源。
- `lib/content.ts`：正文、论文、产品、视频、社交账号与中英内容。
- `components/portfolio.tsx`：页面结构与中英界面文本。
- `app/globals.css`：黑白主题、排版与响应式规则。
- `components/animate-ui/`：官方组件及其依赖，保留许可证。
- `docs/CONTENT_SOURCES.md`：论文状态、数据核验与内容来源。

新版入口为 `app/page.tsx`，部署输出为 `out/`。旧版页面、运行库和未使用资源已清理，历史内容可通过 Git 历史和 `docs/HOMEPAGE_BASELINE.md` 查阅。

## GitHub Pages

`.github/workflows/pages.yml` 会在 main/master 推送或手动运行时构建、上传 `out/` 并部署。仓库 Settings → Pages 的 Source 需设为 GitHub Actions。发布使用 GitHub Actions。

原始图片仍在 `images/`；构建前 `scripts/prepare-assets.mjs` 清理生成目录后只复制当前头像和摄影衍生图片到忽略跟踪的 `public/`。不上传本地论文 PDF。静态输出无需 Node.js 服务器，也不加载远程 UI 运行时。
