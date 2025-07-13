import { NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_AUTH_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/google/callback`
);

// ユーザー情報用スコープ
const userScopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];
// .envで設定したDriveスコープを追加
const driveScopes = process.env.GOOGLE_API_SCOPES?.split(" ") || [];

const scopes = [...userScopes, ...driveScopes];

export async function GET() {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
  });

  return NextResponse.redirect(authorizationUrl);
}
