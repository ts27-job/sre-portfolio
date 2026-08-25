import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giants Player Dashboard",
  description: "読売ジャイアンツ選手の年齢・ポジション分布を確認する検証画面",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
