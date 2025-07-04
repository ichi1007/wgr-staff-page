import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Sans } from "next/font/google";
import "./globals.css";
import HeaderComp from "@/components/Header";
import FooterComp from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";
import AuthGuard from "../components/auth-guard";
import Providers from "./providers";

const Noto_sans_jp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const Noto_sans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WGR Staff Page(仮称)",
  description: "ゲームの操作、集計に関するツールです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${Noto_sans_jp.variable} ${Noto_sans.variable} antialiased`}
      >
        <Providers>
          <AuthGuard>
            <SessionWrapper>
              <HeaderComp />
              <div>{children}</div>
              <FooterComp />
            </SessionWrapper>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
