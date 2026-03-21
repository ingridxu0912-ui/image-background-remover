import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 智能抠图 - 一键去除背景',
  description: '免费在线图片背景去除工具，支持 JPG、PNG、WebP 格式，无需注册，快速处理',
  keywords: '抠图, 去除背景, 图片处理, AI 抠图, 在线工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
