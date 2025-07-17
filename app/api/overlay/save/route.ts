import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // authOptionsのパスはプロジェクト構成に合わせてください

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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
      },
      create: {
        userId,
        overlayCustomName,
        overlayMatchNumber,
        scoreBar,
        teamInfo,
        playerInventory,
        teamDestruction,
      },
    });

    return NextResponse.json(updatedOverlay);
  } catch (error) {
    console.error("Error saving overlay settings:", error);
    return NextResponse.json(
      { error: "Failed to save overlay settings" },
      { status: 500 }
    );
  }
}
