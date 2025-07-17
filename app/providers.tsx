"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import HeaderComp from "@/components/Header";
import FooterComp from "@/components/Footer";
import AccountButton from "@/components/AccountButton";
import AuthGuard from "@/components/auth-guard";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOverlay = pathname.startsWith("/stream/overlay/") || pathname.startsWith("/stream/result/");

  if (isOverlay) {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <HeaderComp />
      <div>
        <AuthGuard>{children}</AuthGuard>
      </div>
      <FooterComp />
      {/* 左下固定のアカウントボタン */}
      <div className="fixed bottom-5 left-5 z-50">
        <AccountButton />
      </div>
    </SessionProvider>
  );
}
