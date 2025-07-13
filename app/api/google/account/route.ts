import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  const accessToken = request.headers.get("authorization")?.split(" ")[1];

  if (!accessToken) {
    return new NextResponse(JSON.stringify({ error: "認証が必要です" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauth2Client,
    });

    const userInfo = await oauth2.userinfo.get();
    return NextResponse.json(userInfo.data);
  } catch (error) {
    console.error("Google APIからのデータ取得に失敗しました:", error);
    return new NextResponse(JSON.stringify({ error: "Google APIエラー" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
