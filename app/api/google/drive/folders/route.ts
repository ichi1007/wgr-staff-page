import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "root";

    // ヘッダーからアクセストークンを取得
    const accessToken = request.headers.get("authorization")?.split(" ")[1];
    if (!accessToken) {
      return NextResponse.json(
        { error: "アクセストークンが必要です" },
        { status: 401 }
      );
    }

    // OAuth2クライアントを設定
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });

    // 必要なスコープを確認
    const tokenInfo = await auth.getTokenInfo(accessToken);
    const requiredScopes = [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ];

    const hasRequiredScopes = requiredScopes.every((scope) =>
      tokenInfo.scopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      return NextResponse.json(
        { error: "必要なスコープが不足しています" },
        { status: 403 }
      );
    }

    let query = `'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`;

    // 共有フォルダを取得するのは「マイドライブ」(root)の場合のみ
    if (folderId === "root") {
      query = `(${query}) or (sharedWithMe and trashed = false and mimeType = 'application/vnd.google-apps.folder')`;
    }

    // フォルダ内のファイル・フォルダを取得
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name, mimeType, parents)",
      orderBy: "name",
    });

    const files = response.data.files || [];

    return NextResponse.json({
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        isFolder: file.mimeType === "application/vnd.google-apps.folder",
        mimeType: file.mimeType,
      })),
    });
  } catch (error) {
    console.error(
      "フォルダ取得エラー:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: "フォルダの取得に失敗しました",
        details:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
