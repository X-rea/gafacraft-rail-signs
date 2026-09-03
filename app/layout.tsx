import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAFAcraft 铁路站牌生成器",
  description: "自定义地铁站内站牌、国铁悬挂站牌与站台头尾牌，支持换乘线路、终点标识和多套广东铁路视觉体系。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
