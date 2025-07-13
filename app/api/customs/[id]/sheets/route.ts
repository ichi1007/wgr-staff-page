import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params は Promise<object>
) {
  try {
    const { spreadsheetId, url } = await request.json();
    const { id: customId } = await params; // params を await して id を取得し、customId に代入

    // カスタム大会にスプレッドシートIDを保存
    await prisma.customs.update({
      where: { id: customId },
      data: {
        spreadsheetId, // 修正: Prismaスキーマに合わせてフィールドを使用
        spreadsheetUrl: url,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("スプレッドシート情報保存エラー:", error);
    return NextResponse.json(
      { error: "スプレッドシート情報の保存に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // GET の params は Promise ではない
) {
  try {
    const customId = params.id;

    const custom = await prisma.customs.findUnique({
      where: { id: customId },
      select: {
        spreadsheetId: true, // 修正: Prismaスキーマに合わせてフィールドを使用
        spreadsheetUrl: true,
      },
    });

    return NextResponse.json({
      spreadsheetId: custom?.spreadsheetId || null,
      spreadsheetUrl: custom?.spreadsheetUrl || null,
    });
  } catch (error) {
    console.error("スプレッドシート情報取得エラー:", error);
    return NextResponse.json(
      { error: "スプレッドシート情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
