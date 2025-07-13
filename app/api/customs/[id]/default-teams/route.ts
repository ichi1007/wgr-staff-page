import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customsId } = await params;
    const { defaultTeams }: { defaultTeams: string[] } = await request.json();

    // customsId に紐づく CustomSetting を見つけて更新
    // CustomSettingはCustomItem経由でCustomsに紐づいているため、findFirstを使用
    const customSetting = await prisma.customSetting.findFirst({
      where: {
        customItem: {
          customsId: customsId,
        },
      },
    });

    if (!customSetting) {
      return NextResponse.json(
        { error: "Custom setting not found" },
        { status: 404 }
      );
    }

    await prisma.customSetting.update({
      where: {
        id: customSetting.id,
      },
      data: {
        defaultTeams: defaultTeams, // 配列をそのまま保存
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving default teams:", error);
    return NextResponse.json(
      { error: "デフォルトチームの保存に失敗しました" },
      { status: 500 }
    );
  }
}
