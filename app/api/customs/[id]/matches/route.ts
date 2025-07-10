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
        id: "asc",
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "マッチデータの取得に失敗しました" },
      { status: 500 }
    );
  }
}
