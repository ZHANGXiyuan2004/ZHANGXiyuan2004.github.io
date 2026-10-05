import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Shine Yuan · 张晰元',
  description: '张晰元 Shine Yuan 的个人主页。Harness 与多模态研究、UESTC 交叉学科开源社区、AI 产品与内容，以及网球、摄影和跑步。',
  icons: { icon: '/images/logo.png' },
  metadataBase: new URL('https://zhangxiyuan2004.github.io'),
  openGraph: { title: 'Shine Yuan · 张晰元', type: 'website', locale: 'zh_CN' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
