"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, LogOut } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

// 認証が不要なパブリックページのリスト
const publicPages = ["/", "/about", "/privacy-policy", "/support"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // パブリックページかどうかをチェック
  const isPublicPage = publicPages.some((page) => {
    return pathname === page || pathname.startsWith(`${page}/`);
  });

  // すべてのHooksを最初に呼び出す
  useEffect(() => {
    // パブリックページの場合は認証チェックをスキップ
    if (isPublicPage) {
      return;
    }

    // 未認証の場合はホームページにリダイレクト
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    // セッションが無効またはユーザーが存在しない場合
    if (status === "authenticated" && session === null) {
      signOut({ callbackUrl: "/" });
    }
  }, [session, status, pathname, isPublicPage, router]);

  // パブリックページの場合は認証チェックをスキップ
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  認証情報を確認中
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  しばらくお待ちください...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  リダイレクト中
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ホームページに戻っています...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "authenticated" && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              セッションエラー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                セッションが無効になりました。セキュリティのため、自動的にログアウトします。
              </AlertDescription>
            </Alert>
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              <p className="text-sm text-gray-600 text-center">
                ログアウト処理中...
                <br />
                しばらくお待ちください
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full"
            >
              手動でログアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
