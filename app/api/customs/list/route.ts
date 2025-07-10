import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const customs = await prisma.customs.findMany({
      include: {
        customItem: {
          include: {
            customSetting: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const response = customs.map((custom) => ({
      id: custom.id,
      customName: custom.customItem[0]?.customSetting?.customName || "Unknown",
      creatorName: "Unknown username",
      createdAt: custom.customItem[0]?.createdAt || new Date().toISOString(),
      pointMode: custom.customItem[0]?.customSetting?.algs
        ? "ALGS"
        : custom.customItem[0]?.customSetting?.polandRule
        ? "Poland Rule"
        : "Custom Rule",
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching customs list:", error);
    return NextResponse.json(
      { error: "カスタム一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
