import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "简易 CRM 系统",
  description: "单人开发的 Next.js CRM 示例"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}

