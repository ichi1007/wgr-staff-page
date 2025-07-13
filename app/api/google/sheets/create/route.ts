import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { title, parentFolderId, userEmail } = await request.json();
    const accessToken = request.headers.get("authorization")?.split(" ")[1];

    if (!accessToken) {
      return NextResponse.json(
        { error: "ユーザーのアクセストークンが必要です" },
        { status: 401 }
      );
    }

    // ユーザーのアクセストークンで認証
    const userAuth = new google.auth.OAuth2();
    userAuth.setCredentials({ access_token: accessToken });

    // Drive API はユーザー認証情報を使用
    const drive = google.drive({ version: "v3", auth: userAuth });
    // Sheets API はサービスアカウント認証情報を使用 (書き込み用)
    // ただし、作成時はユーザー認証情報が必要なので、Sheets API インスタンスはここでは使用しない

    // スプレッドシートをユーザーアカウントで指定フォルダに作成
    let createResponse;
    try {
      const fileMetadata: any = {
        name: title,
        mimeType: "application/vnd.google-apps.spreadsheet",
      };

      if (parentFolderId && parentFolderId !== "root") {
        fileMetadata.parents = [parentFolderId];
      }
      // Note: If parentFolderId is null or 'root', it will be created in the user's root folder by default.

      createResponse = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id, parents, webViewLink", // id, parents, webViewLink を取得
      });
    } catch (createError: any) {
      console.error(
        "スプレッドシート作成エラー (Drive API files.create):",
        createError.response?.data || createError
      );

      if (createError.response?.status === 403) {
        console.error("ユーザー権限エラーの詳細:", {
          userEmail,
          targetFolderId: parentFolderId,
          errorMessage:
            createError.response?.data?.error?.message || createError.message,
        });

        return NextResponse.json(
          {
            error: "スプレッドシートの作成に失敗しました (権限エラー)",
            details:
              createError.response?.data?.error?.message || createError.message,
            suggestions: [
              "Googleアカウントが正しいか確認してください。",
              `指定されたフォルダ (${
                parentFolderId || "マイドライブ"
              }) に対して、ログイン中のGoogleアカウントに「編集者」または「投稿者」の権限があるか確認してください。`,
            ],
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error:
            "スプレッドシートの作成に失敗しました (スプレッドシート作成エラー)",
          details:
            createError.response?.data?.error?.message || createError.message,
        },
        { status: 500 }
      );
    }

    const spreadsheetId = createResponse.data.id;
    const spreadsheetUrl = createResponse.data.webViewLink;

    // 作成したスプレッドシートにサービスアカウントを編集者として追加
    // この権限付与もユーザー認証情報で行う
    try {
      await drive.permissions.create({
        // drive (userAuth) を使用
        fileId: spreadsheetId!,
        requestBody: {
          type: "user",
          role: "writer", // 編集者権限
          emailAddress: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        },
        fields: "id", // レスポンスでIDだけ取得
      });
      console.log(
        `サービスアカウント (${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}) をスプレッドシート (${spreadsheetId}) に追加しました。`
      );
    } catch (permissionError: any) {
      console.error(
        "権限設定エラー (サービスアカウントへの権限付与):",
        permissionError.response?.data || permissionError
      );
      // サービスアカウントの追加に失敗した場合でも、スプレッドシート自体は作成されているため、
      // ユーザーには作成成功を伝えつつ、サービスアカウントの追加失敗を通知する。
      // ステータスコードは200系を返す方が適切かもしれないが、今回は元のコードに合わせてエラーとして返します。
      return NextResponse.json(
        {
          error:
            "スプレッドシートの作成に成功しましたが、サービスアカウントの追加に失敗しました。",
          details:
            permissionError.response?.data?.error?.message ||
            permissionError.message,
          suggestions: [
            `スプレッドシート (${spreadsheetUrl}) を開き、サービスアカウント (${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}) を手動で編集者として追加してください。`,
            "サービスアカウントのメールアドレスが正しいか確認してください。",
          ],
        },
        { status: 500 } // 部分的な成功だが、書き込みができない可能性があるのでエラーとして扱う
      );
    }

    // ユーザーへの権限付与は、ユーザー自身が作成者なので不要。
    // 必要であれば、別のユーザーへの権限付与をここに追加する。

    return NextResponse.json({
      spreadsheetId,
      url: spreadsheetUrl,
    });
  } catch (error: any) {
    console.error(
      "スプレッドシート作成処理全体の予期せぬエラー:",
      error.response?.data || error
    );
    return NextResponse.json(
      {
        error: "スプレッドシートの作成中に予期せぬエラーが発生しました",
        details: error.response?.data?.error?.message || error.message,
      },
      { status: 500 }
    );
  }
}
