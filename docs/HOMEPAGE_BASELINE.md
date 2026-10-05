# 个人主页内容与动画编辑稿

> 提取日期：2026-10-05。依据当前工作区的 `index.html`、`styles.css`、`custom.css`、`script.js`；这是源码现状清单，不代表已逐项通过浏览器视觉验收。网页中的英文原文保留，说明使用中文。

## 使用方式

- 直接修改下方标题、文案、条目、链接、图片路径和动画描述；修改后的值视为你希望网页呈现的目标值。
- 可以调整板块或条目顺序；建议保留“板块标识”和条目编号，以便对应原有网页。页面展示标题与本文档章节标题分别记录，避免混淆。
- 删除内容可以写“状态：删除”，隐藏写“状态：隐藏”；新增条目写“状态：新增”，并填写内容。也可以直接删改章节，之后同步时按完整文档与代码差异核对。
- 每个板块的“修改备注”可用自然语言写布局或动画要求，例如“取消固定滚动，改为普通卡片列表”。未修改的字段沿用当前实现。
- `<br>` 表示网页主动换行；不是要显示的文字。图片路径相对于仓库根目录，保留文件名大小写。
- 本文件是人工维护的编辑依据，当前网站不会自动读取 Markdown。你编辑后告诉我“根据这份 MD 同步主页”，我再对应修改 HTML/CSS/JS 并验证。
- 本轮只整理文档，不改网页。范围是首页；四个研究详情页只记录入口映射，不在本文展开正文。若需要同步详情页，请在对应研究条目写明。

## 页面顺序

1. Home：桌面场景、头像、姓名、社交入口。
2. About：五行个人介绍。
3. Photography：横图与竖图双行相册。
4. Research：研究标题与四张研究卡片。
5. Open Source：两个产品项目。
6. Content & Blog：五个视频内容。
7. Contact：照片环与六项联系方式。
8. Footer：版权与所在地。

浮动 Dock 独立于以上阅读顺序，当前只有 About、Research、Product、Blog、Contact 五个入口。

## 0. 网站基础信息

- 板块标识：`head / 全局`
- 状态：保留
- 修改备注：暂无

- 浏览器标题：Shine Yuan
- 网页语言：en
- 搜索摘要：Personal portfolio of Shine Yuan (张晰元). Ph.D. student at ZJU-UIUC Institute, Zhejiang University. Research in Multimodal AI and AI for Science.
- 站点图标：images/logo.png?v=20260518-tab-logo
- 视觉基调：近黑背景、浅色文字、细边线、局部蓝/紫/橙/绿色强调；系统无衬线字体优先使用 Inter。

### 全局动画与交互

- `.reveal`：元素进入视口后添加 `visible`，单次显现；观察阈值为 0.16。About 使用独立阈值 0.18。
- 卡片倾斜：带 `data-tilt` 的研究、产品及 Blog 静态卡片随指针轻微倾斜（X/Y 各约 ±2.5°），抬升 4px；移出复位。
- 高频指针事件通过 requestAnimationFrame 合并更新；这些是按用户操作触发的效果。
- 系统减少动态效果时，CSS 大幅缩短动画/过渡；位置轮换、相册自动滚动、平滑滚动、Blog 滚动序列与 Contact 动态环分别停止或降级。不能据此宣称所有指针 transform 均被禁用。

## 1. 首屏 Home

- 板块标识：`home`
- 状态：保留
- 修改备注：暂无

- 姓名：Shine Yuan
- 头像：images/optimized/avatar/me-512.jpg
- 头像备选：images/optimized/avatar/me-{256,512,768}.webp / .jpg；保留现有裁切。
- 初始城市：Hangzhou
- 城市轮换顺序：Hangzhou → Chengdu → Shanghai

### 1.1 桌面物件

| 条目标识 | 物件 | 图片 | 悬停文案 | 点击链接 |
|---|---|---|---|---|
| desk-mat | 桌垫 | images/victorian-desk.png | 无 | 无 |
| pencil | Apple Pencil | images/desk-pencil.png | 无 | 无 |
| digital-clock | Digital radio clock | images/desk-clock.png | Tech content: 1.25M+ views | 无 |
| notebook | Open research book | images/desk-book.png | Personal MBTI: ESTJ-O-C | 无 |
| laptop | MacBook Pro M3 16-inch 2024 | images/desk-macbook.png | Founder of UESTC Interdisciplinary Association | https://uestc-ia.github.io/ |
| homepod-set | Black and white Apple HomePods | images/desk-homepods.png | Member of Zeta Zero Hub | https://zzh.app/ |
| mouse | Apple Magic Mouse | images/desk-mouse.png | 无 | 无 |

### 1.2 兴趣图标

- 🎾：Tennis
- 📷：Photography
- 🏃‍♂️：Running
- 🎬：Content Creation

### 1.3 社交入口（当前顺序）

- Email：mailto:mail_Xiyuan_Zhang@126.com
- GitHub：https://github.com/ZHANGXiyuan2004
- Bilibili：https://space.bilibili.com/627492887
- Xiaohongshu：https://www.xiaohongshu.com/user/profile/660d61f5000000000600fcdc
- Douyin：https://www.douyin.com/user/MS4wLjABAAAAnvG1Vw82Zareta_IZQyJIRwFGX2Y7MhekSde7Wa-_T_GOH5b9F9SRw03mhwAuThd?from_tab_name=main&relation=0&vid=7632235084963845049

### 1.4 动画与布局

- 桌面由透明 PNG 和 CSS 变换组成；HomePods 是一张合成图。
- DOM 就绪后等待桌面图片解码，最多等待 900ms，开始瀑布式落入；入口动画总时长为 2750ms。实际代码另有 window load 的一次性启动兜底。
- 启动延迟：时钟 160ms、铅笔 260ms、桌垫 320ms、电脑 420ms、HomePods 560ms、书 700ms、鼠标和兴趣图标组 840ms；各自剩余时长用于落入，共同结束。
- 头像与姓名延迟 260ms，城市 420ms；五个社交入口依次延迟 420/500/580/660/740ms，形成同一套落入节奏。
- 入口完成后桌面物件悬停抬升，约 760ms 后轻轻浮动，移出约 720ms 归位；动画作用于物件容器。带标签的物件显示其说明或链接。
- 兴趣图标悬停时突出当前图标并显示兴趣名称。
- 城市在入口完成后每 2300ms 切换一次；旧文字向下 6px 淡出 180ms，新文字从上方 6px 淡入 220ms。减少动态效果时停止轮换。

## 2. 个人介绍 About

- 板块标识：`about`
- 状态：保留
- 修改备注：暂无

### A01

Incoming Ph.D. student at ZJU‑UIUC Institute, supervised by Prof. Bruce Yu.

- ZJU‑UIUC Institute：https://www.zju.edu.cn

### A02

Graduated from UESTC — nominee for the Outstanding Student Award (university-wide top honor).

- UESTC：https://en.uestc.edu.cn/

### A03

Founded the UESTC Interdisciplinary Association and connected with motivated young peers.

- UESTC Interdisciplinary Association：https://uestc-ia.github.io/

### A04

Currently a member of Zeta Zero Hub, exploring entrepreneurship opportunities in AI.

- Zeta Zero Hub：https://zzh.app/

### A05

1.25M+ views · 5K+ followers across tech social media platforms.

### 动画与排版

- 五段大字号编辑式文字，机构名称为链接，荣誉用强调字，播放量和粉丝数使用 `.about-stat-number`。
- 进入视口后从下方 42px 淡入，过渡 680ms；五行分别延迟 0/120/240/360/480ms。
- 段落、机构链接和强调文字有悬停样式；最终表现以共享样式与后置覆盖共同决定。

## 3. 摄影 Photography

- 板块标识：`gallery`
- 状态：保留
- 修改备注：暂无

- 栏目名：Photography
- 标题：Selected shots —<br>Visual China contributor.

### 3.1 横向照片列表（向左移动）

| 条目标识 | 显示地点 / alt | 图片 |
|---|---|---|
| GL01 | Dunhuang | images/optimized/gallery/DSC_2365-1280.webp |
| GL02 | Chongqing | images/optimized/gallery/DSC_2671-1280.webp |
| GL03 | Xiamen | images/optimized/gallery/1-1280.webp |
| GL04 | Chongqing | images/optimized/gallery/DSC_2683-1280.webp |
| GL05 | Chongqing | images/optimized/gallery/DSC_2788-1280.webp |
| GL06 | Chongqing | images/optimized/gallery/DSC_2470-1280.webp |

### 3.2 竖向照片列表（向右移动）

| 条目标识 | 显示地点 / alt | 图片 |
|---|---|---|
| GP01 | Chongqing | images/optimized/gallery/photo2-1280.webp |
| GP02 | Chongqing | images/optimized/gallery/photo3-1280.webp |
| GP03 | Shenzhen | images/optimized/gallery/photo5-1280.webp |
| GP04 | Chongqing | images/optimized/gallery/DSC_2695-1280.webp |
| GP05 | Dunhuang | images/optimized/gallery/IMG_4453-1280.webp |
| GP06 | Dunhuang | images/optimized/gallery/DSC_2187-1280.webp |

### 动画与布局

- 每行 6 张独立照片，HTML 各复制一组实现无缝循环；修改内容时两组需同步，本文只保留一份条目。
- 横图使用 800/1280 响应式资源；竖图使用 544/1280 文件版本（真实宽度因图片而异）。
- 两行反向持续移动，按轨道宽度补偿速度；基础进度速度 0.032，鼠标移到轨道上降至 0.008，即约四分之一速度。
- 鼠标移入单张照片，图片透明度从 0.7 到 1，放大至 1.04；照片为 cover 裁切。
- 当前照片卡片没有跳转链接，也没有有效的“View project”按钮（该伪元素被 custom.css 隐藏）。
- 相册离屏或页面进入后台时暂停，回到可见状态恢复；减少动态效果时停止自动滚动。

## 4. 研究 Research

- 板块标识：`research + .project-grid`
- 状态：保留
- 修改备注：暂无

- 栏目名：Research
- 标题：Multimodal Data / Sensor Fusion<br>& AI for Science.

### R01 · Unified Few-Shot Neuroimaging Segmentation

- 状态：保留
- 标题：Unified Few-Shot Neuroimaging Segmentation
- 标签：MICCAI 2026 / Medical AI / Few-Shot
- 介绍：Adapts vision foundation models to 3D multi-atlas brain MRI segmentation. Achieves 95%+ of fully-supervised performance with <5% labeled data.
- 图片：images/optimized/projects/neuroimaging-card-900.webp
- 详情页：project_neuroimaging.html
- 配色：color-blue

### R02 · Self-Powered Multimodal Emotion Recognition

- 状态：保留
- 标题：Self-Powered Multimodal Emotion Recognition
- 标签：ICDT 2025 / Wearable / EEG
- 介绍：Wearable device integrating voice & EEG for emotion detection. National First Prize, 4 patents filed.
- 图片：images/optimized/projects/emotion-card-900.webp
- 详情页：project_emotion.html
- 配色：color-orange

### R03 · Semantic-Spatial Bayesian Inference for RSVG

- 状态：保留
- 标题：Semantic-Spatial Bayesian Inference for RSVG
- 标签：ACM MM 2026 / Remote Sensing / VLM
- 介绍：Training-free framework for zero-shot remote sensing visual grounding. Surpasses best baseline by 20.95% on DIOR-RSVG.
- 图片：images/optimized/projects/rsvg-card-900.webp
- 详情页：project_rsvg.html
- 配色：color-green

### R04 · Superionic Conductor Screening & Phase Prediction

- 状态：保留
- 标题：Superionic Conductor Screening & Phase Prediction
- 标签：AI4Science / Materials / Active Learning
- 介绍：Active learning loop with MatterSim & MatterGen to screen stable Li-N-S superionic conductor materials via DFT.
- 图片：images/optimized/projects/superionic-card-900.webp
- 详情页：project_superionic.html
- 配色：color-purple

### 动画与布局

- 标题区和卡片网格在 HTML 中是相邻的两个 section；导航锚点在标题区。
- 桌面双列，窄屏调整为单列；卡片进入视口显现，并响应指针倾斜。
- 悬停时项目配图通过 transform 扩展，叠加轻微视差；整卡点击进入对应研究详情页。
- 图片另有 `-card-600.webp` 响应式版本。详情页正文不属于本次提取范围，修改卡片不会自动代表要重写详情正文。

## 5. 开源产品 Open Source

- 板块标识：`product`
- 状态：保留
- 修改备注：暂无

- 栏目名：Open Source
- 标题：Tools I build for the AI community.

### P01

- 状态：保留
- 标题：Ask Why —<br>Decision-Making Skill
- 标签：AI Agent / Skill / Open Source
- 介绍：An AI Agent Skill that surfaces uncertainty as focused decision questions, guiding users through traceable thinking paths. Supports Cursor, Claude Code, Codex and more.
- 图片：images/ask-why-dark.jpg
- View on GitHub：https://github.com/maxkura/Ask_Why
- Watch Video：https://b23.tv/7KZexrM

### P02

- 状态：保留
- 标题：Yuan Knowledge Base —<br>Personal AI Learning Workspace
- 标签：AI Agent / Knowledge Base / Open Source
- 介绍：A personalized knowledge workspace for researching new material, reviewing AI fundamentals, practicing mock interviews, and evolving reusable Agent Skills.
- 图片：images/optimized/product/yuankb-1200.webp
- View on GitHub：https://github.com/ZetaZeroHub/yuan-knowledge-base
- Watch Video：https://www.bilibili.com/video/BV1cyTE6rE2Z/

### 动画与布局

- 两张宽幅卡片上下排列，内容与配图并列，窄屏重新排列；卡片进入视口显现并响应指针倾斜。
- Yuan Knowledge Base 配图使用 contain 保留完整内容。
- 两类按钮随鼠标轻微磁吸位移并放大，按下缩放并产生涟漪，移出复位；该效果仅由 `.product-btn` 触发。
- 当前 Ask Why 的实际图片是 `images/ask-why-dark.jpg`，本文按源码保留，并未自行换成 optimized 路径。

## 6. 视频与教程 Content & Blog

- 板块标识：`blog`
- 状态：保留
- 修改备注：暂无

- 栏目名：Content & Blog
- 标题：Videos & tutorials.<br>1.25M+ views · 5K+ followers.

### B01

- 状态：保留
- 分类：Competition Guide
- 标题：Competition Guide —<br>Lessons from National Award Winners
- 说明：Strategy, review flow, and repeatable contest habits.
- 按钮文案：Watch video
- 链接：https://b23.tv/yFE5ydx
- 封面：images/optimized/blog/blogpost1-1200.webp?v=20260525-mobile-desk-vignette
- 封面时间段：0–2
- 文案时间段：0.15–1.85

### B02

- 状态：保留
- 分类：Academic Figures
- 标题：Academic Figure Design —<br>CCF-A Accepted Paper Walkthrough
- 说明：Publication-ready visual structure from a real paper.
- 按钮文案：Watch video
- 链接：https://b23.tv/TSkpUM4
- 封面：images/optimized/blog/blogpost2-1200.webp?v=20260525-mobile-desk-vignette
- 封面时间段：2–4
- 文案时间段：2.15–3.85

### B03

- 状态：保留
- 分类：AI Image Workflow
- 标题：Beyond ChatGPT Image 2.0 —<br>Publication-Ready Figures
- 说明：Prompting, refinement, and figure polish for research work.
- 按钮文案：Watch video
- 链接：https://b23.tv/GXQFJDy
- 封面：images/optimized/blog/blogpost3-1200.webp?v=20260525-mobile-desk-vignette
- 封面时间段：4–6
- 文案时间段：4.15–5.85

### B04

- 状态：保留
- 分类：Agent Skills
- 标题：Ask Why Skills —<br>Let Agents Ask Before They Act
- 说明：A practical workflow for agent planning and product thinking.
- 按钮文案：Watch video
- 链接：https://b23.tv/7KZexrM
- 封面：images/optimized/blog/blogpost4-1200.webp?v=20260525-mobile-desk-vignette
- 封面时间段：6–8
- 文案时间段：6.15–7.85

### B05

- 状态：保留
- 分类：Personal Knowledge
- 标题：Yuan Knowledge Base —<br>Build Knowledge That Sticks
- 说明：Research, review, and mock interviews in one agent-powered workspace.
- 按钮文案：Watch video
- 链接：https://www.bilibili.com/video/BV1cyTE6rE2Z/
- 封面：images/optimized/blog/blogpost5-1200.webp?v=20260704-yuankb
- 封面时间段：8–10
- 文案时间段：8.15–9.85

### 动画与布局

- 五条内容同时存在于桌面滚动幻灯片和静态回退卡片中；修改标题、链接、封面或排序时，两套都要同步。
- 所有视频标题在破折号 `—` 后主动换行。静态卡片包含封面、播放图标和标题，不包含桌面版的分类/说明/按钮文字。
- 仅宽度 ≥721px 且未开启减少动态效果、GSAP/ScrollTrigger 可用时启用滚动序列。
- 到达视口高度 12% 处固定面板；继续滚动驱动钥匙孔遮罩展开、角标移向四角、五张封面依次淡入淡出、文案从下方进入并向上离开。
- 总时间轴为 10，五张封面各占 2；这些是滚动映射的时间轴单位，并不是自动播放 10 秒。各条目的时间段可在上面修改。
- 底部进度条跟随滚动，五个标记分别高亮；当前视频入口可键盘聚焦，非当前入口退出 Tab 顺序。
- 固定滚动距离是视口高度 ×1.54 与面板高度 ×1.68 中的较大值，scrub 直接跟随滚动。
- 收尾时整体淡出、面板上移 180px、钥匙孔收拢，再进入 Contact。
- 封面 contain 显示，允许暗色留边；面板宽度与产品卡片所在内容区对齐。
- ≤720px、减少动态效果、无 JS 或 GSAP 不可用时使用静态卡片结构。源码包含回退路径，但本次没有执行无 JS 的可见性验收。
- 桌面封面使用占位 src + data-src；正常浏览器中靠近板块（观察提前量 2400px）才开始预热，另有滚动进入时兜底。若没有 IntersectionObserver，代码另有 idle/延时兼容分支。

## 7. 联系 Contact

- 板块标识：`contact`
- 状态：保留
- 修改备注：暂无

- 标题：let's connect.
- 标题强调：connect 使用 em

### 7.1 联系方式（依次展示）

| 条目标识 | 平台 | 显示内容 | 链接 |
|---|---|---|---|
| C01 | Email | mail_Xiyuan_Zhang@126.com | mailto:mail_Xiyuan_Zhang@126.com |
| C02 | GitHub | ZHANGXiyuan2004 | https://github.com/ZHANGXiyuan2004 |
| C03 | Bilibili | 627492887 · 878K+ views | https://space.bilibili.com/627492887 |
| C04 | Xiaohongshu | 11493226950 | https://www.xiaohongshu.com/user/profile/660d61f5000000000600fcdc |
| C05 | Douyin | 74741606998 | https://www.douyin.com/user/MS4wLjABAAAAnvG1Vw82Zareta_IZQyJIRwFGX2Y7MhekSde7Wa-_T_GOH5b9F9SRw03mhwAuThd?from_tab_name=main&relation=0&vid=7632235084963845049 |
| C06 | QQ | 3438036864 | 无，仅文字展示 |

### 7.2 照片环素材（按当前顺序）

- images/contact-ring/1.jpg
- images/contact-ring/DSC_2187.jpg
- images/contact-ring/DSC_2365.jpg
- images/contact-ring/DSC_2470.jpg
- images/contact-ring/DSC_2671.jpg
- images/contact-ring/DSC_2683.jpg
- images/contact-ring/DSC_2695.jpg
- images/contact-ring/DSC_2788.jpg
- images/contact-ring/IMG_0555.jpg
- images/contact-ring/IMG_4453.jpg
- images/contact-ring/photo1.jpg
- images/contact-ring/photo2.jpg
- images/contact-ring/photo3.jpg
- images/contact-ring/photo4.jpg
- images/contact-ring/photo5.jpg

### 7.3 动画与布局

- 黑色背景上三层照片圆环，分别 12、18、24 个方形照片平面；15 张照片循环使用。WebGL 内做居中方形裁切，不生成新的方形文件。
- 向下滚动接近本节时，小环渐显并扩展成完整大环；相邻环反向旋转，环的旋转进度从固定前连续延伸至固定阶段。
- 场景、暗角和联系文字共享 `--contact-landing-y`，在固定开始前平滑落到 0，形成落地感。
- 环动画从 section 顶部到视口 82% 时开始；联系内容在 section 顶部到视口顶部时固定。两个滚动触发器配合，文字时间轴 scrub 为 0.18。
- 桌面固定距离为 max(视口高度 ×5.05, (条目数 +0.9) ×430px)；≤720px 则为 max(视口高度 ×3.75, (条目数 +0.9) ×300px)。手机端正常动态模式也有照片环固定动画，并非一律静态。
- 标题先淡入并上移归位，联系方式按 Email → GitHub → Bilibili → Xiaohongshu → Douyin → QQ 顺序淡入/上移淡出，最后一项停留。
- 每次突出一个居中的无边框文字条目；平台名称使用平台强调色。悬停/聚焦只改变文字颜色，没有磁吸、位移、玻璃背景、阴影或涟漪。
- 当前激活的链接可点击和键盘聚焦，其余链接暂时退出 Tab 顺序。QQ 是 div，仅显示号码，当前没有复制或跳转操作。
- 纹理在接近本节约 600px 时加载，并有滚动进入兜底；使用本地压缩照片。
- 减少动态效果时显示静态照片环及全部联系方式，不执行固定叙事；WebGL 初始化失败有静态样式降级，依赖缺失则保持基础内容。

## 8. 浮动导航 Dock

- 板块标识：`.dock`
- 状态：保留
- 修改备注：暂无

| 顺序 | 名称 / 提示 | 目标 |
|---|---|---|
| 1 | About | #about |
| 2 | Research | #research |
| 3 | Product | #product |
| 4 | Blog | #blog |
| 5 | Contact | #contact |

### 动画与交互

- 与首屏入口一起浮入；指针悬停时提示文字显现，图标轻微磁吸并放大至 1.06，按下出现涟漪。
- 观察视口中心附近的对应板块，切换导航激活态。
- 点击页内锚点以 1500ms 平滑滚动；带初始 hash 进入页面时有 2000ms 滚动逻辑。减少动态效果时直接定位。
- 当前不含 Home / Photography 入口；新增或改序需同时调整导航链接与监听的板块集合。
- 很窄屏幕保持紧凑、图标为主的导航。

## 9. 页脚 Footer

- 板块标识：`footer`
- 状态：保留
- 修改备注：暂无

- 文字 1：© 2026 Shine Yuan
- 文字 2：Hangzhou, China
- 动画：无独立 JS 时间轴；随页面自然滚动显示。

## 10. 联动修改与实现对照

| 编辑内容 | 后续网页改动位置 / 联动项 |
|---|---|
| 姓名、身份 | `index.html` 的 head、Home、About、Footer；只按实际修改范围同步 |
| 总播放量 / 粉丝数 | 时钟悬停、About、Blog；Bilibili 的 878K+ 是单平台显示值，不自动等同总数 |
| 社交账号 | Home 和 Contact 两处；QQ 当前仅 Contact 有 |
| 城市列表 | `script.js` 的 initLocationRotation；初始值另在 Home，Footer 是单独固定文案 |
| 摄影条目 | 横/竖行各自两套重复节点、srcset/尺寸/alt |
| 研究条目 | `.project-grid`；如明确要求再修改对应 project_*.html 正文 |
| 产品条目 | `#product`；Ask Why、Yuan Knowledge Base 在 Blog 也有视频入口 |
| Blog 条目数量或顺序 | 幻灯片、cue、回退卡片、进度标记数量、data-duration、data-start/end |
| Contact 条目 | `[data-contact-step]`、顺序、链接、平台色及对应动态/静态样式 |
| 板块增删或顺序 | HTML 结构、导航、观察器、锚点、相邻滚动动画衔接 |
| 动画 | `script.js` 对应 init 函数；`styles.css` 共享样式；`custom.css` 后置覆盖 |

### 当前记录中的差异与边界

- AGENTS.md 的一处样式说明仍写 1.12M+ / 4K+；实际首页的时钟、About、Blog 使用 1.25M+ / 5K+。本文采用当前代码值，不自行更新说明文件。
- head 摘要写 Ph.D. student，而 About 写 Incoming Ph.D. student；这是已有文案差异，本文保留，后续可统一。
- Contact 的 QQ 当前不可点击；不能把“所有联系方式可点击”作为已经实现的功能。
- 摄影卡片是展示内容，没有照片详情页或灯箱；视频是封面和外链入口，不是内嵌播放器。
- 本文记录现有声明和研究数据，没有对荣誉、论文状态、播放量等进行外部真实性核验。

### 后续实现默认保留的约束

- 桌面仍使用本地 PNG；不引入 model-viewer/GLB 或远程运行时。GSAP、ScrollTrigger、Three.js 仅首页加载本地文件。
- 保留原图，图片替换时维护已有响应式衍生图及懒加载、异步解码、低优先级和真实尺寸。仅 MacBook 首屏图具有 high 获取优先级。
- Blog 与 Contact 保持按接近板块加载素材的策略，使用当前压缩资源。
- 改 CSS/JS 后统一更新首页和四个详情页的缓存版本串（现为 20260704-yuankb-progress），详情页不增加 GSAP/Three。
- 后续实际修改网页时通过 HTTP 检查桌面、640px、320px、减少动态效果与必要的回退状态；按改动范围检查资源加载、动画、外链、锚点和键盘访问。

## 11. 整体修改备注

暂无。可在这里写全站风格、语言、布局、内容取舍或动画节奏要求；各板块的具体内容请优先在对应章节直接修改。
