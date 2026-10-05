# Animate UI 组件来源与适配

- 官方仓库：https://github.com/imskyleen/animate-ui
- 文档：https://animate-ui.com/docs
- 上游 commit：`efeb96ffd7a3b7a4868667e4ac3c346620fb3044`
- 官方 registry 源码保存在 `components/animate-ui/`；保留 [许可证](../components/animate-ui/LICENSE.md)（MIT + Commons Clause）。

| 组件 | 当前用途 |
|---|---|
| Tabs / Highlight | 产品与视频切换、高亮、面板位移和高度过渡 |
| Button | 按钮 hover/tap；视频只对播放按钮应用动画 |
| FlipButton | 社区入口、发送邮件，正反面等宽高 |
| Fade / SplittingText | 内容淡入、姓名分字入场 |
| CountingNumber | 成员数与传播数据计数 |
| RotatingText | 六个城市纵向轮换，后台和离屏暂停 |
| Accordion | 展开论文简介 |
| Collapsible | 默认收起的九张摄影作品，点击展开/收起 |
| Dialog | 单张彩色照片放大，关闭后返回触发按钮焦点 |
| Tooltip | 复制组件的可选提示原语 |

依赖原语包括 Slot、use-is-in-view、use-controlled-state、get-strict-context。

本地适配：导入路径改为本地目录；Tabs 在 hydration 后设置 inert 与 aria-hidden，并补齐键盘导航；RotatingText 增加 paused 参数。页面遵循 reduced-motion，禁用计数、轮换、翻转及空间过渡，保留可读内容。无 JS 时显示静态中文和两个内容面板。

无 GSAP、Three.js、远程运行时或手写关键帧。Next.js 静态导出，运行依赖随站点本地打包。
