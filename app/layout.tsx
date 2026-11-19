import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "夏日广美 · GAFAcraft",
  description: "广州美术学院 · 晴日微缩校园",
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
