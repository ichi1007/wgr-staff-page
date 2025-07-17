import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // セッションが無効または存在しない場合はホームページにリダイレクト
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // /admin/users-managementへのアクセス時はadminロールをチェック
    if (req.nextUrl.pathname === "/admin/users-management") {
      const token = req.nextauth.token;

      // adminロールがない場合はホームページにリダイレクト
      if (!token?.hasAdminRole) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // トークンが存在し、discordUserIdが設定されている場合のみ認証
        return !!token?.discordUserId;
      },
    },
    pages: {
      // ログインページを無効化（NextAuth.jsのデフォルトログインページも無効）
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    /*
      認証が必要ないパブリックページのパス
      - ホームページ ("/")
      - aboutページ ("/about")
      - プライバシーポリシーページ ("/privacy-policy")
      - サポートページ ("/support")
      - API認証エンドポイント ("/api/auth/")
      - その他のパブリックAPIエンドポイント ("/public/")
      - _errorページ ("/_error")
      - _not-foundページ ("/_not-found")
      - Googleサイト認証ファイル ("/google17b609747b541c79.html")
    */
    "/((?!$|public/|auth/|_error|_not-found|api/auth/|about$|about/|privacy-policy$|privacy-policy/|support$|support/|google17b609747b541c79\\.html$|stream/overlay/|img/|svg/|stream/result/).*)",
  ],
};
