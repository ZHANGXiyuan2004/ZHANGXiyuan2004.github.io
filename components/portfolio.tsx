'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { MotionConfig, useReducedMotion, useAnimationControls, useInView } from 'motion/react';
import { ArrowUpRight, Github, Copy, Check, Menu, X, Star, GitFork, Play, Camera, MoveUpRight, MapPin, Footprints, CircleDot, ChevronDown, Users, Maximize2, Mail } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent } from '@/components/animate-ui/components/animate/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Fade } from '@/components/animate-ui/primitives/effects/fade';
import { SplittingText } from '@/components/animate-ui/primitives/texts/splitting';
import { RotatingTextContainer, RotatingText } from '@/components/animate-ui/primitives/texts/rotating';
import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number';
import { getContent, navigation, type Language } from '@/lib/content';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/animate-ui/components/radix/accordion';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/animate-ui/components/radix/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/animate-ui/primitives/radix/collapsible';
import { FlipButton, FlipButtonFront, FlipButtonBack } from '@/components/animate-ui/components/buttons/flip';

const EntranceLanguage = createContext<Language>('zh');
const entranceEase = [0.22, 1, 0.36, 1] as const;

const cities = { zh: ['杭州', '北京', '上海', '成都', '深圳', '香港'], en: ['Hangzhou', 'Beijing', 'Shanghai', 'Chengdu', 'Shenzhen', 'Hong Kong'] };
function CityLocation({ language }: { language: Language }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <div className="portrait-caption" aria-label={cities[language].join(' · ')}><MapPin size={14} /><div aria-hidden="true">{reduced ? <span>{cities[language][0]}</span> : <RotatingTextContainer key={language} text={cities[language]} duration={2400} delay={2400} inView inViewOnce={false} paused={!visible}><RotatingText /></RotatingTextContainer>}</div></div>;
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const language = useContext(EntranceLanguage);
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true });
  const controls = useAnimationControls();
  const offset = ['hero-greeting-reveal', 'portrait-block', 'about-strip'].includes(className) ? 16 : 0;
  const previousLanguage = useRef(language);
  useEffect(() => {
    const switching = previousLanguage.current !== language;
    previousLanguage.current = language;
    if (reduced) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }
    if (!entered) return;
    controls.set({ opacity: switching ? .25 : 0, y: switching ? offset / 2 : offset });
    void controls.start({ opacity: 1, y: 0, transition: {
      duration: switching ? .42 : .7, ease: entranceEase,
      delay: switching ? 0 : delay / 1000,
    } });
    return () => controls.stop();
  }, [controls, delay, entered, language, offset, reduced]);
  return <Fade ref={ref} initial={{ opacity: 0, y: offset }} animate={controls} className={`section-reveal ${className}`}>{children}</Fade>;
}
function NumberStat({ number, decimals = 0, suffix = '' }: { number: number; decimals?: number; suffix?: string }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <span aria-label={`${number}${suffix}`} className="stat-number"><span aria-hidden="true">{mounted && !reduced ? <CountingNumber number={number} decimalPlaces={decimals} inView inViewOnce transition={{ stiffness: 80, damping: 25 }} /> : number.toFixed(decimals)}{suffix}</span></span>;
}
function External({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}
function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return <div className="section-label"><span>{number}</span><span>{children}</span></div>;
}
function CopyButton({ value, label, language, compact = false }: { value: string; label: string; language: Language; compact?: boolean }) {
  const tr = (zh: string, en: string) => language === 'zh' ? zh : en;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true); setError(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch { setError(true); }
  }
  const button = <Button variant="outline" size={compact ? 'icon' : 'default'} onClick={copy} aria-label={copied ? tr('已复制', 'Copied') : label} className="copy-button">{copied ? <Check /> : <Copy />}{!compact && (copied ? tr('已复制', 'Copied') : label)}</Button>;
  return <>{compact ? button : <Tooltip><TooltipTrigger asChild>{button}</TooltipTrigger><TooltipContent><span role="status">{error ? `${tr('请手动复制：', 'Copy manually: ')}${value}` : copied ? tr('已复制到剪贴板', 'Copied to clipboard') : label}</span></TooltipContent></Tooltip>}<span className="sr-only" aria-live="polite">{copied ? tr('已复制到剪贴板', 'Copied to clipboard') : error ? `${tr('复制失败，请手动复制 ', 'Copy failed. Copy manually: ')}${value}` : ''}</span></>;
}


type Detail = { title: string; text: string; image?: string };
function ActionLink({ href, children, back, external = false }: { href: string; children: ReactNode; back: string; external?: boolean }) {
  return <FlipButton asChild variant="outline" className="action-flip" aria-label={typeof children === 'string' ? children : back} whileFocus="hover"><a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}><FlipButtonFront>{children}<ArrowUpRight size={15} /></FlipButtonFront><FlipButtonBack aria-hidden="true">{back}<ArrowUpRight size={15} /></FlipButtonBack></a></FlipButton>;
}
function PaperEntry({ paper, language }: { paper: ReturnType<typeof getContent>['papers'][number]; language: Language }) {
  const tr = (zh: string, en: string) => language === 'zh' ? zh : en;
  const reduced = useReducedMotion();
  if (!paper.summary) return <article className="research-entry"><div className="paper-trigger paper-static"><span className="paper-copy"><span className="paper-meta"><span className="venue">{paper.venue}</span><span className="status">{tr('在投', 'Under review')}</span></span><span className="paper-title">{paper.title}</span></span></div></article>;
  return <AccordionItem value={paper.id} className="research-entry"><AccordionTrigger className="paper-trigger"><span className="paper-copy"><span className="paper-meta"><span className="venue">{paper.venue}</span><span className={`status ${paper.status === 'Published' ? 'is-published' : ''}`}>{paper.status === 'Published' ? tr('已发表', 'Published') : tr('在投', 'Under review')}</span></span><span className="paper-title">{paper.title}</span></span><span className="paper-status">{paper.authorship}</span></AccordionTrigger><AccordionContent transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 25 }}><div className="paper-details"><p>{paper.summary}</p></div></AccordionContent></AccordionItem>;
}

export default function Portfolio() {
  const reduced = useReducedMotion();
  const [language, setLanguage] = useState<Language>('zh');
  const tr = (zh: string, en: string) => language === 'zh' ? zh : en;
  const { profile, papers, products, videos, social, photos, community } = getContent(language);
  useEffect(() => {
    try { if (localStorage.getItem('portfolio-language') === 'en') setLanguage('en'); } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = language === 'zh' ? '张晰元 · 个人主页' : 'Shine Yuan · Portfolio';
  }, [language]);
  function changeLanguage(next: Language) {
    setLanguage(next);
    try { localStorage.setItem('portfolio-language', next); } catch {}
  }
  const [active, setActive] = useState('about');
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState('products');
  const [photosOpen, setPhotosOpen] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const detailOpener = useRef<HTMLElement | null>(null);
  const openDetail = (next: Detail, opener: HTMLElement) => { detailOpener.current = opener; setDetail(next); };
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -55% 0px' });
    navigation.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  function tabKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'products' : event.key === 'End' ? 'videos' : tab === 'products' ? 'videos' : 'products';
    setTab(next); document.getElementById(`tab-${next}`)?.focus();
  }
  return <MotionConfig reducedMotion="user"><TooltipProvider openDelay={120}><EntranceLanguage.Provider value={language}>
    <a href="#main" className="skip-link">{tr('跳转到正文', 'Skip to content')}</a>
    <header className="site-header">
      <div className="header-inner">
        <a href="#about" className="wordmark" aria-label={tr("张晰元首页", "Shine Yuan homepage")}><span className="monogram">sy.</span><span>{tr("张晰元", "Shine Yuan")}<span className="wordmark-dot"> / </span><span className="wordmark-sub">{tr('个人主页', 'Portfolio')}</span></span></a>
        <nav id="main-navigation" aria-label={tr("主导航", "Main navigation")} className={`navigation ${menuOpen ? 'is-open' : ''}`}>
          {navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => { setMenuOpen(false); setActive(item.id); }}><span>{tr(item.zh, item.label)}</span></a>)}
        </nav>
        <div className="header-controls"><div className="language-switch" role="group" aria-label="Language / 语言"><Button variant="ghost" size="sm" aria-pressed={language === 'zh'} onClick={() => changeLanguage('zh')} lang="zh-CN">中文</Button><span>/</span><Button variant="ghost" size="sm" aria-pressed={language === 'en'} onClick={() => changeLanguage('en')} lang="en">EN</Button></div>
        <Button variant="ghost" size="icon" className="menu-toggle" aria-label={menuOpen ? tr('关闭导航', 'Close menu') : tr('打开导航', 'Open menu')} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div>
      </div>
    </header>
    <main id="main" className={`page-shell locale-${language}`}>
      <section id="about" className="hero section-anchor" aria-labelledby="hero-title">
        <div className="hero-main">
          <div className="hero-type">
            <Reveal className="hero-greeting-reveal" delay={40}><p className="hero-greeting">{tr("Shine Yuan", "张晰元 / Xiyuan Zhang")}</p></Reveal>
            <h1 id="hero-title"><SplittingText key={language} text={tr("张晰元", "Shine Yuan.")} type="chars" initial={{ opacity: 0, y: '55%', rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .75, ease: entranceEase }} stagger={language === 'zh' ? .09 : .035} delay={100} disableAnimation={!!reduced} /></h1>
          </div>
          <Reveal className="portrait-block" delay={160}>
            <div className="portrait-frame"><img src="/images/optimized/avatar/me-512.webp" srcSet="/images/optimized/avatar/me-256.webp 256w, /images/optimized/avatar/me-512.webp 512w" sizes="(max-width: 640px) 120px, 194px" alt="Shine Yuan 张晰元" width="768" height="589" decoding="async" fetchPriority="high" /></div>
            <CityLocation language={language} />
          </Reveal>
        </div>
        <Reveal className="about-strip" delay={320}>
          <SectionLabel number="01">{tr('关于我', 'About')}</SectionLabel>
          <div className="about-content"><p className="about-description">{language === 'en' ? <>Incoming Ph.D. student at <External href="https://www.zju.edu.cn/"><strong>ZJU‑UIUC Institute</strong></External>, Zhejiang University.<br />Graduated from <External href="https://en.uestc.edu.cn/"><strong>UESTC</strong></External> — <strong><em>Outstanding Student Award</em></strong> nominee; founded the <External href="https://uestc-ia.github.io/"><strong>UESTC Interdisciplinary Association</strong></External>.<br />My work focuses on Harness and multimodal AI, alongside open-source community building, open-source product development and technical content creation.</> : <>浙江大学<External href="https://www.zju.edu.cn/"><strong>伊利诺伊大学厄巴纳香槟校区联合学院（ZJU‑UIUC Institute）</strong></External>准博士生。<br />毕业于<External href="https://en.uestc.edu.cn/"><strong>电子科技大学</strong></External>，获校级最高荣誉<strong><em>「成电杰出学生」</em></strong>提名，并创立<External href="https://uestc-ia.github.io/"><strong>电子科技大学交叉学科协会</strong></External>。<br />工作主要关注 Harness 和多模态，同时参与开源社区建设、开源项目与产品开发，以及自媒体技术内容创作。</>}</p></div>
        </Reveal>
      </section>

      <section id="research" className="content-section section-anchor" aria-labelledby="research-title">
        <Reveal><SectionLabel number="02">{tr('研究', 'Research')}</SectionLabel><div className="section-heading"><h2 id="research-title">{tr('论文发表与投稿', 'Publications & submissions')}</h2></div></Reveal>
        <Reveal><Accordion type="single" collapsible className="paper-list">{papers.map(paper => <PaperEntry key={paper.id} paper={paper} language={language} />)}</Accordion></Reveal>
        <Reveal><div className="earlier-heading"><h3>{tr('早期研究经历', 'Earlier work')}</h3></div><div className="earlier-narrative"><p>{tr('早期研究从材料与硬件出发，围绕自供能多模态情绪识别，结合材料、传感硬件与物联网开展工作。随后转向 AI for Science，在上海交通大学朱虹老师指导下，将密度泛函理论（DFT）计算与主动学习用于材料性能预测，逐步拓展到人工智能研究。', 'My earlier research spanned materials, hardware and the Internet of Things through self-powered multimodal emotion recognition. I then moved into AI for Science, working with Prof. Hong Zhu at Shanghai Jiao Tong University on materials property prediction using density functional theory (DFT) and active learning, before broadening my focus to AI.')}</p></div></Reveal>
      </section>

      <section id="community" className="content-section section-anchor" aria-labelledby="community-title">
        <Reveal><SectionLabel number="03">{tr('开源社区', 'Open-source community')}</SectionLabel></Reveal>
        <Reveal><div className="community-panel"><div className="community-copy"><span className="community-role">{tr('创始人', 'Founder')} · UESTC IA</span><h2 id="community-title">{tr('电子科技大学交叉学科协会', 'UESTC Interdisciplinary Association')}</h2><p className="body-copy">{community.description}</p><div className="community-actions"><ActionLink href={community.url} back={tr('打开官网', 'Visit website')} external>{tr('社团主页', 'Association website')}</ActionLink><ActionLink href={community.join} back={tr('进入社群', 'Open community')} external>{tr('加入社团', 'Join the community')}</ActionLink></div></div><div className="community-stats"><Users size={28} strokeWidth={1.2} /><div><NumberStat number={community.members} suffix="+" /><span>{tr('社团成员', 'Members')}</span></div></div></div></Reveal>
      </section>

      <section id="making" className="content-section section-anchor" aria-labelledby="making-title">
        <Reveal><SectionLabel number="04">{tr('自媒体与产品', 'Products & media')}</SectionLabel><div className="section-heading"><h2 id="making-title">{tr('开源产品与技术内容', 'Open-source tools & content')}</h2></div></Reveal>
        <Reveal><div className="reach-stats"><div><NumberStat number={1.25} decimals={2} suffix="M+" /><span>{tr('全平台累计播放', 'Total video views')}</span></div><div><NumberStat number={5.2} decimals={1} suffix="K+" /><span>{tr('全平台关注者', 'Followers across platforms')}</span></div><Button asChild variant="ghost" hoverScale={1.05} className="reach-link"><a href={social[1].href} target="_blank" rel="noopener noreferrer"><Play size={18} /> {tr('前往 Bilibili', 'Watch on Bilibili')} <ArrowUpRight size={16} /></a></Button></div></Reveal>
        <Reveal><Tabs value={tab} onValueChange={setTab} className="making-tabs"><div className="tabs-heading"><TabsList onKeyDown={tabKeys} aria-label={tr("查看产品或视频", "Products and videos")}><TabsTrigger value="products" id="tab-products" aria-controls="panel-products" aria-selected={tab === 'products'} tabIndex={tab === 'products' ? 0 : -1}>{tr('开源产品', 'Projects')} <span className="tab-count">02</span></TabsTrigger><TabsTrigger value="videos" id="tab-videos" aria-controls="panel-videos" aria-selected={tab === 'videos'} tabIndex={tab === 'videos' ? 0 : -1}>{tr('视频与教程', 'Videos & tutorials')} <span className="tab-count">05</span></TabsTrigger></TabsList></div>
          <TabsContents><TabsContent value="products" id="panel-products" aria-labelledby="tab-products"><div className="product-grid">{products.map(product => <article key={product.id} className="product-card"><div className="product-top"><span className="product-icon"><Github size={22} strokeWidth={1.4} /></span><span className="small-label">{product.category}</span><span className="row-index">{product.number}</span></div><h3>{product.name}</h3><p className="body-copy">{product.description}</p><div className="repo-metrics"><span><Star size={14} />{product.stars} {tr("星标", "stars")}</span><span><GitFork size={14} />{product.forks} {tr("分支", "forks")}</span></div><p className="promotion"><Play size={12} />{product.promotion}</p><div className="product-actions"><Button asChild variant="outline" size="sm"><a href={product.repo} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight /></a></Button><Button asChild variant="ghost" size="sm" hoverScale={1.06}><a href={product.video} target="_blank" rel="noopener noreferrer">{tr('观看介绍', 'Watch demo')} <ArrowUpRight size={14} /></a></Button></div></article>)}</div></TabsContent>
          <TabsContent value="videos" id="panel-videos" aria-labelledby="tab-videos"><div className="video-list">{videos.map((video, i) => <article key={video.href} className="video-row"><span className="row-index">0{i + 1}</span><span><span className="small-label">{video.category}</span><strong>{video.title}</strong></span><Button asChild variant="outline" size="icon" hoverScale={1.12} className="video-play"><a href={video.href} target="_blank" rel="noopener noreferrer" aria-label={`${tr('播放', 'Play')}: ${video.title}`}><Play size={15} /></a></Button></article>)}</div></TabsContent></TabsContents>
        </Tabs></Reveal>
      </section>

      <section id="beyond" className="content-section section-anchor" aria-labelledby="beyond-title">
        <Reveal><SectionLabel number="05">{tr('兴趣爱好', 'Interests')}</SectionLabel><div className="section-heading"><h2 id="beyond-title">{tr('网球、摄影与跑步', 'Tennis, photography & running')}</h2></div></Reveal>
        <Collapsible open={photosOpen} onOpenChange={setPhotosOpen}><div className="hobby-grid">
          <Reveal><article className="hobby-card"><div className="hobby-top"><CircleDot size={23} strokeWidth={1.3} /><span className="small-label">{tr('01 / 网球', '01 / TENNIS')}</span></div><h3>{tr('网球', 'Tennis')}</h3><div className="hobby-big">3.5<span>NTRP</span></div><ul><li>{tr('两次校级网球比赛亚军', 'Two-time university tennis tournament runner-up')}</li><li>{tr('受邀观赛中国网球公开赛', 'Invited spectator at the China Open')}</li></ul></article></Reveal>
          <Reveal delay={60}><article className="hobby-card"><div className="hobby-top"><Camera size={23} strokeWidth={1.3} /><span className="small-label">{tr('02 / 摄影', '02 / PHOTOGRAPHY')}</span></div><h3>{tr('摄影', 'Photography')}</h3><div className="hobby-big">500px<span>{tr('供稿人', 'Contributor')}</span></div><CollapsibleTrigger asChild><Button variant="outline" className="detail-button" aria-controls="photographs">{photosOpen ? tr('收起摄影作品', 'Hide photographs') : tr('查看摄影作品', 'View photographs')}<ChevronDown size={14} className={photosOpen ? 'rotate-180' : ''} /></Button></CollapsibleTrigger></article></Reveal>
          <Reveal delay={120}><article className="hobby-card"><div className="hobby-top"><Footprints size={23} strokeWidth={1.3} /><span className="small-label">{tr('03 / 跑步', '03 / RUNNING')}</span></div><h3>{tr('跑步', 'Running')}</h3><div className="hobby-big">42.195<span>{tr('km · 马拉松大众一级', 'km · Marathon amateur level 1')}</span></div><ul><li>{tr('参加四川省运动会', 'Sichuan Provincial Games participant')}</li><li>{tr('电子科技大学跑步协会副会长', 'Vice president, UESTC Running Association')}</li></ul></article></Reveal>
        </div>
        <CollapsibleContent id="photographs" transition={{ duration: reduced ? 0 : .35, ease: 'easeInOut' }}><div className="photo-heading"><span className="small-label">{tr('摄影作品', 'Selected photographs')}</span><span>{tr('摄影选集 · 01—09', 'PHOTOGRAPHS · 01—09')}</span></div><div className="photo-grid">{photos.map((photo, i) => <figure key={photo.file}><button className="photo-open" aria-label={`${tr('查看大图', 'Enlarge photograph')}: ${photo.place}`} aria-haspopup="dialog" onClick={event => openDetail({ title: photo.place, text: tr('摄影 / 张晰元', 'Photography / Shine Yuan'), image: `/images/optimized/gallery/${photo.file}-1280.webp` }, event.currentTarget)}><img src={`/images/optimized/gallery/${photo.file}-1280.webp`} srcSet={`/images/optimized/gallery/${photo.file}-${photo.width === 1280 ? 800 : 544}.webp ${photo.width === 1280 ? 800 : 544}w, /images/optimized/gallery/${photo.file}-1280.webp ${photo.width}w`} sizes="(max-width: 640px) 90vw, 33vw" width={photo.width} height={photo.height} loading="lazy" decoding="async" fetchPriority="low" alt={photo.caption} /><span className="photo-open-label"><Maximize2 size={15} />{tr('查看大图', 'Enlarge')}</span></button><figcaption><span>{photo.place}</span><span>0{i + 1}</span></figcaption></figure>)}</div></CollapsibleContent></Collapsible>
      </section>

      <section id="contact" className="contact-section section-anchor" aria-labelledby="contact-title">
        <Reveal><SectionLabel number="06">{tr('联系方式', 'Contact')}</SectionLabel><div className="contact-grid-v2"><div className="contact-email-card"><Mail size={26} strokeWidth={1.3} /><h2 id="contact-title">{tr('邮箱', 'Email')}</h2><a className="contact-address" href={`mailto:${profile.email}`}>{profile.email}</a><div className="contact-card-actions"><ActionLink href={`mailto:${profile.email}`} back={tr('打开邮件应用', 'Open email app')}>{tr('发送邮件', 'Send email')}</ActionLink></div></div><div className="contact-channels">{social.map(s => <a key={s.name} className="channel-link" href={s.href} target="_blank" rel="noopener noreferrer"><span>{s.name}</span><span>{s.handle}</span><ArrowUpRight size={16} /></a>)}<div className="qq-channel"><span>QQ</span><span>{profile.qq}</span><CopyButton language={language} value={profile.qq} label={tr('复制 QQ 号码', 'Copy QQ number')} compact /></div></div></div></Reveal>
      </section>
      <footer className="site-footer"><span>{tr('© 2026 张晰元', '© 2026 Shine Yuan')}</span><span>{tr('中国 · 杭州', 'Hangzhou, China')}</span><a href="#about">{tr('回到顶部', 'Back to top')} <MoveUpRight size={13} /></a></footer>
    </main>
    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent showCloseButton={false} transition={reduced ? { duration: 0 } : undefined} className={detail?.image ? 'detail-dialog photo-dialog' : 'detail-dialog'} onCloseAutoFocus={event => { event.preventDefault(); detailOpener.current?.focus(); }}><DialogTitle>{detail?.title}</DialogTitle><DialogDescription>{detail?.text}</DialogDescription>{detail?.image && <img src={detail.image} alt={detail.title} width="1280" height="853" className="dialog-photo" />}<DialogClose asChild><Button variant="outline" size="icon" className="dialog-close" aria-label={tr('关闭详情', 'Close details')}><X size={18} /></Button></DialogClose></DialogContent></Dialog>
    <noscript><style>{`.section-reveal, #hero-title span { opacity: 1 !important; transform: none !important; } [data-slot="tabs-contents"] { height: auto !important; } [data-slot="tabs-contents"] > div { display: block !important; transform: none !important; } [data-slot="tabs-content"] { filter: none !important; } [data-slot="tabs-list"], .menu-toggle, .copy-button, .language-switch { display: none !important; } .navigation { display: flex !important; position: static !important; flex-wrap: wrap; } .header-inner { flex-wrap: wrap; height: auto; padding-block: 12px; } .site-header { height: auto; position: static; }`}</style></noscript>
  </EntranceLanguage.Provider></TooltipProvider></MotionConfig>;
}
