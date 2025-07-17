import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // authOptionsのパスはプロジェクト構成に合わせてください

const prisma = new PrismaClient();

// オーバーレイ設定を取得するGETハンドラ
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const overlaySettings = await prisma.overlay.findUnique({
      where: { userId },
    });

    if (!overlaySettings) {
      // 設定が存在しない場合はデフォルト値を返す
      return NextResponse.json({
        overlayCustomName: "WGR CUP",
        overlayMatchNumber: 1,
        scoreBar: true,
        teamInfo: true,
        playerInventory: true,
        teamDestruction: true,
        observerName: "",
      });
    }

    return NextResponse.json(overlaySettings);
  } catch (error) {
    console.error("Error fetching overlay settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch overlay settings" },
      { status: 500 }
    );
  }
}

// オーバーレイ設定を更新するPUTハンドラ
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const {
      overlayCustomName,
      overlayMatchNumber,
      scoreBar,
      teamInfo,
      playerInventory,
      teamDestruction,
      observerName,
    } = body;

    const updatedOverlay = await prisma.overlay.upsert({
      where: { userId },
      update: {
        overlayCustomName,
        overlayMatchNumber,
        scoreBar,
        teamInfo,
        playerInventory,
        teamDestruction,
        observerName,
      },
      create: {
        userId,
        overlayCustomName,
        overlayMatchNumber,
        scoreBar,
        teamInfo,
        playerInventory,
        teamDestruction,
        observerName,
      },
    });

    return NextResponse.json(updatedOverlay);
  } catch (error) {
    console.error("Error updating overlay settings:", error);
    return NextResponse.json(
      { error: "Failed to update overlay settings" },
      { status: 500 }
    );
  }
}
