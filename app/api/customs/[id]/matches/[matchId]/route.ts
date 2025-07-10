import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const { id, matchId } = await params;

    // トランザクションでマッチデータを削除
    await prisma.$transaction(async (tx) => {
      // PlayerResultを削除
      await tx.playerResult.deleteMany({
        where: {
          customDataId: matchId,
        },
      });

      // TeamResultを削除
      await tx.teamResult.deleteMany({
        where: {
          customDataId: matchId,
        },
      });

      // CustomDataを削除
      await tx.customData.delete({
        where: {
          id: matchId,
        },
      });

      // CustomsのitemCountを更新
      await tx.customs.update({
        where: { id },
        data: {
          itemCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
