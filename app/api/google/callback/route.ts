import { NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_AUTH_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/google/callback`
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // アクセストークンを安全な場所に保存する（例：データベース、セッション）
      const accessToken = tokens.access_token;

      // クライアントに成功を通知
      return new NextResponse(
        `<script>
          window.opener.postMessage({ type: 'google-auth-success', accessToken: '${accessToken}' }, '*');
          window.close();
        </script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    } catch (error) {
      console.error("アクセストークンの取得に失敗しました:", error);
      return new NextResponse("認証エラー", { status: 400 });
    }
  }

  return new NextResponse("認証コードがありません", { status: 400 });
}
