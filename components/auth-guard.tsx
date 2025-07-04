"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // すべてのHooksを最初に呼び出す
  useEffect(() => {
    // ルートページの場合は認証チェックをスキップ
    if (pathname === "/") {
      return;
    }

    // セッションが無効またはユーザーが存在しない場合
    if (status === "authenticated" && session === null) {
      signOut({ callbackUrl: "/" });
    }
  }, [session, status, pathname]);

  // ルートページの場合は認証チェックをスキップ
  if (pathname === "/") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Please login to access this page</div>
      </div>
    );
  }

  if (status === "authenticated" && !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session invalid, logging out...</div>
      </div>
    );
  }

  return <>{children}</>;
}
