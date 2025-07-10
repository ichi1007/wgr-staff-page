import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CustomSetting を検索
    const customSetting = await prisma.customSetting.findFirst({
      where: {
        customItem: {
          customsId: id,
        },
      },
      include: {
        placementPoint: true,
      },
    });

    if (!customSetting) {
      return NextResponse.json({ error: "Custom not found" }, { status: 404 });
    }

    // 必要なフィールドのみを返す
    const response = {
      customName: customSetting.customName,
      algs: customSetting.algs,
      polandRule: customSetting.polandRule,
      teamDeathMatch: customSetting.teamDeathMatch,
      killPoint: customSetting.killPoint,
      killPointLimit: customSetting.killPointLimit,
      placementPoint: customSetting.placementPoint,
      matchPoint: customSetting.matchPoint, // matchPointを追加
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching custom data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // トランザクションで関連データを削除
    await prisma.$transaction(async (tx) => {
      // CustomData関連を削除
      await tx.playerResult.deleteMany({
        where: {
          customData: {
            customItem: {
              customsId: id,
            },
          },
        },
      });
      await tx.teamResult.deleteMany({
        where: {
          customData: {
            customItem: {
              customsId: id,
            },
          },
        },
      });
      await tx.customData.deleteMany({
        where: {
          customItem: {
            customsId: id,
          },
        },
      });

      // CustomDataAll関連を削除
      await tx.teamData.deleteMany({
        where: {
          customDataAll: {
            customItem: {
              customsId: id,
            },
          },
        },
      });
      await tx.customDataAll.deleteMany({
        where: {
          customItem: {
            customsId: id,
          },
        },
      });

      // CharacterUse関連を削除
      await tx.characterUseMatches.deleteMany({
        where: {
          characterUse: {
            customItem: {
              customsId: id,
            },
          },
        },
      });
      await tx.characterUse.deleteMany({
        where: {
          customItem: {
            customsId: id,
          },
        },
      });

      // PlayerCountTop関連を削除
      await tx.killCountTop.deleteMany({
        where: {
          playerCountTop: {
            customItem: {
              customsId: id,
            },
          },
        },
      });
      await tx.damageCountTop.deleteMany({
        where: {
          playerCountTop: {
            customItem: {
              customsId: id,
            },
          },
        },
      });
      await tx.playerCountTop.deleteMany({
        where: {
          customItem: {
            customsId: id,
          },
        },
      });

      // PlacementPoint関連を削除
      await tx.placementPoint.deleteMany({
        where: {
          customSettings: {
            some: {
              customItem: {
                customsId: id,
              },
            },
          },
        },
      });

      // CustomSettingを削除
      await tx.customSetting.deleteMany({
        where: {
          customItem: {
            customsId: id,
          },
        },
      });

      // CustomItemを削除
      await tx.customItem.deleteMany({
        where: { customsId: id },
      });

      // 最後にCustomsを削除
      await tx.customs.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Custom and related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting custom and related data:", error);
    return NextResponse.json(
      { error: "Failed to delete custom and related data" },
      { status: 500 }
    );
  }
}
