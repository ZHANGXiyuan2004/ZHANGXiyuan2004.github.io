# 个人主页编辑稿 · Animate UI 双语版

更新时间：2026-10-05。对应本次重做的新主页。旧版完整提取稿保留在 docs/HOMEPAGE_BASELINE.md。

## 编辑方法

直接修改各节的中文、英文、顺序、条目或动画要求，再告诉助手“根据 MD 同步主页”。这份文件不是网站自动读取的数据源。新增/删除条目可注明“新增/删除”；未修改项沿用当前实现。建议保留板块标识和条目 id。

## 全局要求

- 默认中文，提供 中文 / EN 切换并记住选择；两种版本展示相同事实。
- 黑白简约 UI，头像和摄影作品保留彩色。
- 只展示信息，不添加口号、诗意说明、统计来源备注；维护依据另见 docs/CONTENT_SOURCES.md。
- 使用 Animate UI 官方组件；React 19、Next.js 16、TypeScript、Tailwind CSS 4、Motion，静态导出。
- 不展示旧版桌面场景、学术项目配图、产品海报和 WebGL 联系照片环。

板块顺序：About → Research → 开源社区 → 自媒体与产品 → 爱好 → 联系方式。

## 1. About / 关于我

- 标识：about
- 中文姓名：张晰元
- 英文姓名：Shine Yuan
- 头像：images/optimized/avatar/me-512.webp（保留 256/512 响应式版本和彩色）
- 城市：杭州、北京、上海、成都、深圳、香港 / Hangzhou, Beijing, Shanghai, Chengdu, Shenzhen, Hong Kong。头像下用 Animate UI RotatingText 纵向轮换；减少动态效果时静态显示，后台标签页及离开视口时暂停。
- 中文第一行：浙江大学[伊利诺伊大学厄巴纳香槟校区联合学院（ZJU‑UIUC Institute）](https://www.zju.edu.cn/)准博士生。
- 中文第二行：毕业于[电子科技大学](https://en.uestc.edu.cn/)，获校级最高荣誉「成电杰出学生」提名，并创立[电子科技大学交叉学科协会](https://uestc-ia.github.io/)。
- 中文第三行：工作主要关注 Harness 和多模态，同时参与开源社区建设、开源项目与产品开发，以及自媒体技术内容创作。
- 英文第一行：Incoming Ph.D. student at ZJU‑UIUC Institute, Zhejiang University.
- 英文第二行：Graduated from UESTC — Outstanding Student Award nominee; founded the UESTC Interdisciplinary Association.
- 英文第三行：My work focuses on Harness and multimodal AI, alongside open-source community building, open-source product development and technical content creation.
- 保留院校和协会链接，奖项加粗斜体。整体与板块标题左侧对齐；宽屏为三行，窄屏自然换行。不使用卡片。
- 动画：Animate UI SplittingText 姓名分字入场；Fade 头像和简介淡入；Button 操作反馈。

## 2. Research / 论文发表与投稿

- 标识：research
- 仅文字列表，不展示图表、指标对比或方法配图。

### brainmatch

- 中文：BrainMATCH：实现跨队列与扫描协议的高数据效率脑 MRI 图谱迁移
- 英文：BrainMATCH enables data-efficient transfer of brain MRI atlases across cohorts and protocols
- 期刊：Nature Communications
- 状态：在投 / Under review
- 作者：共同第一作者 / Co-first author
- 详情：脑 MRI 图谱在不同队列与扫描协议之间的数据高效迁移。

### mem-sonar

- 中文：Mem-SONAR：基于交替强化学习的自组织与自导航记忆
- 英文：Mem-SONAR: Self-Organizing and Self-Navigating Memory via Alternating Reinforcement Learning
- 投稿/发表处：ICLR 2027
- 状态：在投 / Under review
- 中文补充：智能体记忆
- 英文补充：Agent memory

- 中文详情：将记忆组织与检索建模为同一语言模型的两种可训练能力：Organizer 用语义路径构建记忆树，Navigator 根据问题沿路径检索证据。通过多轮交替强化学习，让组织策略与检索行为相互改进。
- 英文详情：Models memory organization and retrieval as two trainable capabilities of the same LLM. An Organizer builds a memory tree using semantic paths, while a Navigator follows those paths to retrieve evidence. Multi-round alternating reinforcement learning aligns the two capabilities.

### gate

- 中文：GATE：面向证据感知智能体推荐的粒度自适应记忆分层
- 英文：GATE: Granularity-Adaptive Memory Tiering for Evidence-Aware Agentic Recommendation
- 投稿/发表处：KDD
- 作者：共同第一作者 / Co-first author
- 状态：在投 / Under review
- 中文补充：推荐系统
- 英文补充：Recommendation

- 中文详情：针对用户偏好复杂度不同带来的记忆粒度失配，构建多层偏好记忆。结合证据感知的语言模型重排序器与轻量路由器，为每次请求选择适合的记忆层级，兼顾推荐质量和推理开销。
- 英文详情：Builds preference memories at multiple levels of detail to handle differences in user preference complexity. An evidence-aware LLM reranker and a lightweight router select an appropriate memory tier for each request, balancing recommendation quality and inference cost.

### ada-fave

- 中文：Ada-Fave：用于序列推荐的自适应先验增强流式平均速度方法
- 英文：Ada-Fave: Adaptive Prior Enhanced Flow-based Average Velocity for Sequential Recommendation
- 投稿/发表处：IEEE TKDE
- 状态：在投 / Under review
- 中文补充：推荐系统
- 英文补充：Recommendation

- 中文详情：从用户交互序列构建自适应语义先验，以平均速度实现单步生成式推荐。结合分阶段双时间条件注入与 JVP 轨迹约束，减少从噪声出发的先验失配和多步求解冗余。
- 英文详情：Constructs an adaptive semantic prior from interaction sequences for one-step generative recommendation using average velocity. Stage-aware dual-time conditioning and a JVP-based trajectory constraint address prior mismatch and redundant iterative generation.

### neuroimaging

- 中文：基于视觉基础模型的多图谱神经影像统一少样本分割框架
- 英文：A Unified Few-Shot Framework for Multi-Atlas Neuroimaging Segmentation Leveraging Vision Foundation Models
- 投稿/发表处：MICCAI 2026
- 状态：已发表 / Published
- 中文补充：医学影像 · 共同第一作者
- 英文补充：Medical AI · Co-first author

- 中文详情：将视觉基础模型适配到三维多图谱脑影像分割。结合解剖先验自监督、线性 Transformer 匹配与轻量细化模块，在少量标注下进行跨图谱标签迁移，并通过冻结主干、微调细化模块适配新图谱。
- 英文详情：Adapts vision foundation models to 3D multi-atlas brain segmentation. Anatomically informed self-supervision, linear Transformer matching and a lightweight refinement module support label transfer with few annotations. New atlases are accommodated by freezing the backbone and tuning the refinement module.

### 早期研究经历 / Earlier work

- 中文：早期研究从材料与硬件出发，围绕自供能多模态情绪识别，结合材料、传感硬件与物联网开展工作。随后转向 AI for Science，在上海交通大学朱虹老师指导下，将密度泛函理论（DFT）计算与主动学习用于材料性能预测，逐步拓展到人工智能研究。
- 英文：My earlier research spanned materials, hardware and the Internet of Things through self-powered multimodal emotion recognition. I then moved into AI for Science, working with Prof. Hong Zhu at Shanghai Jiao Tong University on materials property prediction using density functional theory (DFT) and active learning, before broadening my focus to AI.
- Earlier work 正文使用完整内容宽度，不留右侧空列。
- 不再展示早期论文列表、会议和状态，RSVG 从主页移除。
- 论文行：顶部为会议/期刊与状态，右侧为作者排序；Animate UI Accordion 展开后显示研究简介，不提供复制标题按钮。
- MICCAI、Ada-Fave、BrainMATCH 和 KDD 为共同第一作者；ICLR 作者顺序待用户补充。

## 3. 开源社区 / Open-source community

- 标识：community
- 名称：电子科技大学交叉学科协会 / UESTC Interdisciplinary Association
- 身份：创始人 / Founder
- 中文：主要讨论 LLM、Physical AI、AI for Science 和 AI for Engineering。以技术交流为主，也会聊聊行业八卦，分享有意思的产品。
- 英文：A community focused on LLMs, Physical AI, AI for Science and AI for Engineering. Mostly technical discussions, with room for industry chatter and interesting products.
- 成员：600+
- 官网：https://uestc-ia.github.io/
- 社群入口：https://uestc-ia.github.io/community.html
- 动画：Fade 内容淡入，CountingNumber 成员数进入视口时计数。

仅保留两个按钮：社团主页 / Association website、加入社团 / Join the community。使用 Animate UI FlipButton 翻转动效。合作单位名单和数量不在主页显示。

## 4. 自媒体与产品 / Products & media

- 标识：making
- 中文标题：开源产品与技术内容
- 英文标题：Open-source tools & content
- 全平台累计播放：1.25M+
- 全平台关注者：5.2K+
- 布局：顶部统计；下方 Animate UI Tabs 切换“开源产品”和“视频与教程”，不展示海报。

### ask-why

- 名称：Ask Why
- 中文功能：让 Agent 先问对问题，再执行。把不确定性转化为聚焦的决策问题，留下可追溯的思考与规划路径。支持 Cursor、Claude Code、Codex 等工具。
- 英文功能：A decision-making skill that turns uncertainty into focused questions and traceable plans. Supports Cursor, Claude Code, Codex and other AI coding tools.
- 星标：119
- 分支：9
- 中文宣发：已发布功能演示与工作流教程
- 英文宣发：Feature demo and workflow tutorial published
- 仓库：https://github.com/maxkura/Ask_Why
- 视频：https://b23.tv/7KZexrM

### yuan-kb

- 名称：Yuan Knowledge Base
- 中文功能：个人 AI 知识工作区，支持新知识调研、基础复习、模拟面试和可复用 Agent Skills 管理。
- 英文功能：A personal AI workspace for research, reviewing fundamentals, mock interviews and reusable Agent Skills.
- 星标：25
- 分支：6
- 中文宣发：已发布知识库搭建与使用介绍
- 英文宣发：Setup guide and product walkthrough published
- 仓库：https://github.com/ZetaZeroHub/yuan-knowledge-base
- 视频：https://www.bilibili.com/video/BV1cyTE6rE2Z/

### 视频与教程

- 1. 中文：竞赛经验：从国奖获奖者的实践出发
  - 英文：Competition Guide — Lessons from National Award Winners
  - 链接：https://b23.tv/yFE5ydx
- 2. 中文：学术图表设计：CCF-A 论文实例拆解
  - 英文：Academic Figure Design — CCF-A Accepted Paper Walkthrough
  - 链接：https://b23.tv/TSkpUM4
- 3. 中文：Beyond ChatGPT Image 2.0：科研绘图工作流
  - 英文：Beyond ChatGPT Image 2.0 — Publication-Ready Figures
  - 链接：https://b23.tv/GXQFJDy
- 4. 中文：Ask Why：让 Agent 行动前先提问
  - 英文：Ask Why Skills — Let Agents Ask Before They Act
  - 链接：https://b23.tv/7KZexrM
- 5. 中文：Yuan Knowledge Base：构建能积累的知识
  - 英文：Yuan Knowledge Base — A Personal AI Learning Workspace
  - 链接：https://www.bilibili.com/video/BV1cyTE6rE2Z/

- 动画：Tabs 官方弹簧高亮、面板滑动/高度过渡；Button hover/tap；CountingNumber 统计计数。

## 5. 爱好 / Interests

- 标识：beyond
- 中文标题：网球、摄影与跑步
- 英文标题：Tennis, photography & running

### 网球 / Tennis

- 评级：3.5 / Tennis rating 3.5
- 两次校级网球比赛亚军 / Two-time university tennis tournament runner-up
- 受邀观赛中国网球公开赛 / Invited spectator at the China Open

### 摄影 / Photography

- 500px 供稿人 / 500px Contributor
- 查看摄影作品 / View photographs：点击以 Animate UI Collapsible 展开下方照片，再次点击收起。
- 照片保持彩色，使用现有本地衍生资源。

- 敦煌 / Dunhuang：images/optimized/gallery/DSC_2365-1280.webp（同时保留 -800.webp 响应式版本）
- 重庆 / Chongqing：images/optimized/gallery/DSC_2671-1280.webp（同时保留 -800.webp 响应式版本）
- 厦门 / Xiamen：images/optimized/gallery/1-1280.webp（同时保留 -800.webp 响应式版本）

### 跑步 / Running

- 42.195 km · 马拉松大众一级 / Marathon amateur level 1
- 参加四川省运动会 / Sichuan Provincial Games participant
- 电子科技大学跑步协会副会长 / Vice president, UESTC Running Association

动画：三项简介和照片网格使用 Fade，照片本身无灰度滤镜、无自动轮播。

## 6. 联系方式 / Contact

- 标识：contact
- 邮箱：mail_Xiyuan_Zhang@126.com
- QQ：3438036864
- QQ 支持复制；邮箱只保留发送邮件入口，支持 mailto。

- GitHub：ZHANGXiyuan2004 — https://github.com/ZHANGXiyuan2004
- Bilibili：627492887 — https://space.bilibili.com/627492887
- 小红书：11493226950 — https://www.xiaohongshu.com/user/profile/660d61f5000000000600fcdc
- 抖音：74741606998 — https://www.douyin.com/user/MS4wLjABAAAAnvG1Vw82Zareta_IZQyJIRwFGX2Y7MhekSde7Wa-_T_GOH5b9F9SRw03mhwAuThd?from_tab_name=main&relation=0&vid=7632235084963845049

动画：社交账号不显示悬浮浮窗；FlipButton 发送邮件翻转按钮；Button 复制 QQ 反馈。邮箱与社交账号分为两张卡片。

## 导航与响应式

- 六个导航对应上述六节；切换中英文保留当前标签页，记住语言偏好。
- 桌面横向导航；手机菜单展开六个入口。
- 产品在桌面双列、手机单列；照片宽屏三列、很窄屏单列。
- 减少动态效果时文字、淡入和计数静态呈现；禁止自定义滚动固定动画。
- 无 JS 时显示中文静态内容。

## 整体修改备注

暂无。

## 本轮交互与排版更新

- 产品与内容板块保留原设计。
- 板块编号改为方形徽标；About 等标题改为 18px 的清晰分节标题。
- About 按最新文案显示院校、奖项、协会信息及三个指定超链接。
- 当前研究列表 5 项；Earlier work 为跨学科研究经历。
- 网球和跑步卡片不设详情按钮；摄影按钮展开下方照片。
- 摄影图片保持彩色，点击通过 Dialog 以透视、缩放和模糊入场动效打开大图，支持 Esc 关闭并返回触发按钮焦点。
- 继续遵守系统减少动态效果偏好，不自行编写关键帧。

- 摄影选集共 9 张，均用现有本地彩色 WebP。
- 社区和发送邮件 FlipButton 正反两面尺寸一致。播放入口使用 Animate UI Button 弹簧缩放反馈。

- 视频列表仅播放按钮响应悬浮和点击动画，整行内容保持静止。

- 最新摄影交互：默认收起；View photographs / 查看摄影作品通过官方 Collapsible 在兴趣卡片下方展开九张照片，再次点击收起。不打开照片流弹窗；单张照片仍可点击放大。新增 photo3（重庆）、photo5（深圳）、IMG_4453（敦煌）现有彩色衍生资源。

### 摄影替换（按用户上传顺序）

- 05：selection-05-20261005，北京 / Beijing。
- 07：selection-07-20261005，北京天坛 / Beijing。
- 08：selection-08-20261005，太原 / Taiyuan。
- 09：selection-09-20261005，重庆 / Chongqing。
- 四张原图保存在 images/gallery-originals/；展示使用 images/optimized/gallery/ 下 800/1280 WebP。其余五张及默认收起交互不变。

- 首页 Contact / 联系我采用无边框、无背景、无阴影的文字加箭头样式，保留按钮悬浮反馈和 #contact 跳转。

- 地点核对：05 对应主项目 images/beijing2.png，08 对应 images/taiyuan.jpeg，已目视核对原图。
