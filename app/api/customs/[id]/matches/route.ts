import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const matches = await prisma.customData.findMany({
      where: {
        customItem: {
          customsId: id,
        },
      },
      include: {
        playerResult: true,
        teamResult: {
          orderBy: {
            placement: "asc",
          },
        },
      },
      orderBy: {
        // CustomDataにcreatedAtがないため、関連するCustomItemのcreatedAtでソート
        // 古い順 (昇順) に変更
        customItem: {
          createdAt: "asc",
        },
      },
    });

    // レスポンスデータを整形してマップ名と開始時刻を含める
    // APIから古い順で取得されるため、ここでは順序変更は不要
    const formattedMatches = matches.map((match) => ({
      ...match,
      mapName: match.mapName,
      matchStart: match.matchStart,
    }));

    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "マッチデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}
