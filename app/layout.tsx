import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAFAcraft 铁路站牌生成器",
  description: "GAFAcraft 标识工坊：综合线路牌、悬挂站名牌、站台乘车牌与换乘导向牌，支持原创风格、像素字体、方块背景、文字配色和 PNG / SVG 导出。",
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
