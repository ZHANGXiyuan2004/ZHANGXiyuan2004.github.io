// Public-facing content. Provenance and status qualifications: docs/CONTENT_SOURCES.md.
export const profile = {
  name: 'Shine Yuan', chineseName: '张晰元', location: 'Hangzhou, China',
  email: 'mail_Xiyuan_Zhang@126.com', qq: '3438036864',
  description: '浙江大学伊利诺伊大学厄巴纳香槟校区联合学院（ZJU‑UIUC Institute）准博士生。毕业于电子科技大学，获校级最高荣誉「成电杰出学生」提名。创立电子科技大学交叉学科协会。',
};
export const navigation = [
  { id: 'about', label: 'About', zh: '关于' },
  { id: 'research', label: 'Research', zh: '研究' },
  { id: 'community', label: 'Community', zh: '开源社区' },
  { id: 'making', label: 'Products', zh: '自媒体与产品' },
  { id: 'beyond', label: 'Interests', zh: '兴趣爱好' },
  { id: 'contact', label: 'Contact', zh: '联系' },
];
export const papers = [
  { id: 'brainmatch', title: 'BrainMATCH：实现跨队列与扫描协议的高数据效率脑 MRI 图谱迁移', venue: 'Nature Communications', status: 'Under review', topic: '医学影像', authorship: '共同第一作者', authorshipEn: 'Co-first author', summary: '研究脑 MRI 图谱在不同人群队列和扫描协议之间的数据高效迁移，减少图谱迁移对标注数据的依赖。', summaryEn: 'Studies data-efficient transfer of brain MRI atlases across cohorts and imaging protocols, reducing the reliance on labeled data for atlas transfer.' },
  { id: 'mem-sonar', title: 'Mem-SONAR：基于交替强化学习的自组织与自导航记忆', venue: 'ICLR 2027', status: 'Under review', topic: '智能体记忆', authorship: '', authorshipEn: '', summary: '将记忆组织与检索建模为同一语言模型的两种可训练能力：Organizer 用语义路径构建记忆树，Navigator 根据问题沿路径检索证据。通过多轮交替强化学习，让组织策略与检索行为相互改进。', summaryEn: 'Models memory organization and retrieval as two trainable capabilities of the same LLM. An Organizer builds a memory tree using semantic paths, while a Navigator follows those paths to retrieve evidence. Multi-round alternating reinforcement learning aligns the two capabilities.' },
  { id: 'gate', title: 'GATE：面向证据感知智能体推荐的粒度自适应记忆分层', venue: 'KDD', status: 'Submitted', topic: '推荐系统', authorship: '共同第一作者', authorshipEn: 'Co-first author', summary: '针对用户偏好复杂度不同带来的记忆粒度失配，构建多层偏好记忆。结合证据感知的语言模型重排序器与轻量路由器，为每次请求选择适合的记忆层级，兼顾推荐质量和推理开销。', summaryEn: 'Builds preference memories at multiple levels of detail to handle differences in user preference complexity. An evidence-aware LLM reranker and a lightweight router select an appropriate memory tier for each request, balancing recommendation quality and inference cost.' },
  { id: 'ada-fave', title: 'Ada-Fave：用于序列推荐的自适应先验增强流式平均速度方法', venue: 'IEEE TKDE', status: 'Submitted', topic: '推荐系统', authorship: '共同第一作者', authorshipEn: 'Co-first author', summary: '从用户交互序列构建自适应语义先验，以平均速度实现单步生成式推荐。结合分阶段双时间条件注入与 JVP 轨迹约束，减少从噪声出发的先验失配和多步求解冗余。', summaryEn: 'Constructs an adaptive semantic prior from interaction sequences for one-step generative recommendation using average velocity. Stage-aware dual-time conditioning and a JVP-based trajectory constraint address prior mismatch and redundant iterative generation.' },
  { id: 'neuroimaging', title: '基于视觉基础模型的多图谱神经影像统一少样本分割框架', venue: 'MICCAI 2026', status: 'Published', topic: '医学影像', authorship: '共同第一作者', authorshipEn: 'Co-first author', summary: '将视觉基础模型适配到三维多图谱脑影像分割。结合解剖先验自监督、线性 Transformer 匹配与轻量细化模块，在少量标注下进行跨图谱标签迁移，并通过冻结主干、微调细化模块适配新图谱。', summaryEn: 'Adapts vision foundation models to 3D multi-atlas brain segmentation. Anatomically informed self-supervision, linear Transformer matching and a lightweight refinement module support label transfer with few annotations. New atlases are accommodated by freezing the backbone and tuning the refinement module.' },
];
export const products = [
  { id: 'ask-why', name: 'Ask Why', category: '智能体技能', description: '让 Agent 先问对问题，再执行。把不确定性转化为聚焦的决策问题，留下可追溯的思考与规划路径。支持 Cursor、Claude Code、Codex 等工具。', repo: 'https://github.com/maxkura/Ask_Why', stars: 119, forks: 9, video: 'https://b23.tv/7KZexrM', promotion: '已发布功能演示与工作流教程', number: '01' },
  { id: 'yuan-kb', name: 'Yuan Knowledge Base', category: '个人知识工作区', description: '个人 AI 知识工作区，支持新知识调研、基础复习、模拟面试和可复用 Agent Skills 管理。', repo: 'https://github.com/ZetaZeroHub/yuan-knowledge-base', stars: 25, forks: 6, video: 'https://www.bilibili.com/video/BV1cyTE6rE2Z/', promotion: '已发布知识库搭建与使用介绍', number: '02' },
];
export const videos = [
  { title: '竞赛经验：从国奖获奖者的实践出发', category: '竞赛经验', href: 'https://b23.tv/yFE5ydx' },
  { title: '学术图表设计：CCF-A 论文实例拆解', category: '科研工作流', href: 'https://b23.tv/TSkpUM4' },
  { title: 'Beyond ChatGPT Image 2.0：科研绘图工作流', category: 'AI 工作流', href: 'https://b23.tv/GXQFJDy' },
  { title: 'Ask Why：让 Agent 行动前先提问', category: '智能体技能', href: 'https://b23.tv/7KZexrM' },
  { title: 'Yuan Knowledge Base：构建能积累的知识', category: '个人知识库', href: 'https://www.bilibili.com/video/BV1cyTE6rE2Z/' },
];
export const social = [
  { name: 'GitHub', handle: 'ZHANGXiyuan2004', href: 'https://github.com/ZHANGXiyuan2004' },
  { name: 'Bilibili', handle: '627492887', href: 'https://space.bilibili.com/627492887' },
  { name: '小红书', handle: '11493226950', href: 'https://www.xiaohongshu.com/user/profile/660d61f5000000000600fcdc' },
  { name: '抖音', handle: '74741606998', href: 'https://www.douyin.com/user/MS4wLjABAAAAnvG1Vw82Zareta_IZQyJIRwFGX2Y7MhekSde7Wa-_T_GOH5b9F9SRw03mhwAuThd?from_tab_name=main&relation=0&vid=7632235084963845049' },
];
export const photos = [
  { file: 'DSC_2365', place: '敦煌', caption: '敦煌摄影作品', width: 1280, height: 818 },
  { file: 'DSC_2671', place: '重庆', caption: '重庆摄影作品', width: 1280, height: 852 },
  { file: '1', place: '厦门', caption: '厦门摄影作品', width: 1280, height: 853 },
  { file: 'DSC_2683', place: '重庆', caption: '重庆城市摄影', width: 1280, height: 852 },
  { file: 'selection-05-20261005', place: '北京', caption: '北京古建筑与飞鸟', width: 1280, height: 853 },
  { file: 'DSC_2470', place: '重庆', caption: '重庆街景摄影', width: 1280, height: 852 },
  { file: 'selection-07-20261005', place: '北京', caption: '北京天坛祈年殿', width: 1280, height: 639 },
  { file: 'selection-08-20261005', place: '太原', caption: '太原城市与飞鸟', width: 1280, height: 709 },
  { file: 'selection-09-20261005', place: '重庆', caption: '重庆桥梁与城市天际线', width: 1280, height: 852 },
];
export const community = {
  name: '电子科技大学交叉学科协会', englishName: 'UESTC Interdisciplinary Association',
  description: '主要讨论 LLM、Physical AI、AI for Science 和 AI for Engineering。以技术交流为主，也会聊聊行业八卦，分享有意思的产品。',
  members: 600, url: 'https://uestc-ia.github.io/', join: 'https://uestc-ia.github.io/community.html',
};

export type Language = 'zh' | 'en';
export function getContent(language: Language) {
  if (language === 'zh') return { profile, papers, products, videos, social, photos, community };
  const englishPapers = [
    ['BrainMATCH enables data-efficient transfer of brain MRI atlases across cohorts and protocols', 'Medical AI'],
    ['Mem-SONAR: Self-Organizing and Self-Navigating Memory via Alternating Reinforcement Learning', 'Agent memory'],
    ['GATE: Granularity-Adaptive Memory Tiering for Evidence-Aware Agentic Recommendation', 'Recommendation'],
    ['Ada-Fave: Adaptive Prior Enhanced Flow-based Average Velocity for Sequential Recommendation', 'Recommendation'],
    ['A Unified Few-Shot Framework for Multi-Atlas Neuroimaging Segmentation Leveraging Vision Foundation Models', 'Medical AI · Co-first author'],
  ];
  const englishProducts = [
    { category: 'Agent skill', description: 'A decision-making skill that turns uncertainty into focused questions and traceable plans. Supports Cursor, Claude Code, Codex and other AI coding tools.', promotion: 'Feature demo and workflow tutorial published' },
    { category: 'Knowledge workspace', description: 'A personal AI workspace for research, reviewing fundamentals, mock interviews and reusable Agent Skills.', promotion: 'Setup guide and product walkthrough published' },
  ];
  const englishVideos = [
    ['Competition Guide — Lessons from National Award Winners', 'Competition'],
    ['Academic Figure Design — CCF-A Accepted Paper Walkthrough', 'Research workflow'],
    ['Beyond ChatGPT Image 2.0 — Publication-Ready Figures', 'AI workflow'],
    ['Ask Why Skills — Let Agents Ask Before They Act', 'Agent skills'],
    ['Yuan Knowledge Base — A Personal AI Learning Workspace', 'Personal knowledge'],
  ];
  const places = ['Dunhuang', 'Chongqing', 'Xiamen', 'Chongqing', 'Beijing', 'Chongqing', 'Beijing', 'Taiyuan', 'Chongqing'];
  return {
    profile: { ...profile, description: 'Incoming Ph.D. student at ZJU‑UIUC Institute, Zhejiang University. Graduated from UESTC — nominee for the Outstanding Student Award (university-wide top honor). Founded the UESTC Interdisciplinary Association.' },
    papers: papers.map((paper, i) => ({ ...paper, title: englishPapers[i][0], topic: englishPapers[i][1], authorship: paper.authorshipEn, summary: paper.summaryEn })),
    products: products.map((product, i) => ({ ...product, ...englishProducts[i] })),
    videos: videos.map((video, i) => ({ ...video, title: englishVideos[i][0], category: englishVideos[i][1] })),
    social: social.map((entry, i) => ({ ...entry, name: ['GitHub', 'Bilibili', 'Xiaohongshu', 'Douyin'][i] })),
    photos: photos.map((photo, i) => ({ ...photo, place: places[i], caption: `Photograph of ${places[i]}` })),
    community: { ...community, description: 'A community focused on LLMs, Physical AI, AI for Science and AI for Engineering. Mostly technical discussions, with room for industry chatter and interesting products.' },
  };
}
