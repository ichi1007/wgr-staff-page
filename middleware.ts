import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // セッションが無効または存在しない場合の処理
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
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
  }
);

export const config = {
  matcher: [
    /*
      ルート（/）は除外して、ログアウト状態でもアクセス可能
      /public 配下、/auth 配下、/_error、/_not-found、/api/auth も除外
    */
    "/((?!$|public/|auth/|_error|_not-found|api/auth).*)",
  ],
};
