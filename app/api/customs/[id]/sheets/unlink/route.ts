import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params は Promise<object>
) {
  try {
    const awaitedParams = await params; // params を await する
    const customId = awaitedParams.id; // await したオブジェクトから id を取得

    // カスタム大会のスプレッドシート情報を削除 (null に設定)
    await prisma.customs.update({
      where: { id: customId },
      data: {
        spreadsheetId: null,
        spreadsheetUrl: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("スプレッドシート連携解除エラー:", error);
    return NextResponse.json(
      { error: "スプレッドシート連携の解除に失敗しました" },
      { status: 500 }
    );
  }
}
