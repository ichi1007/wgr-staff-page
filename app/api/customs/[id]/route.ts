import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // CustomSetting を検索
    const customSetting = await prisma.customSetting.findFirst({
      where: {
        customItem: {
          customsId: id,
        },
      },
      include: {
        placementPoint: true,
        customItem: {
          // customItem を含めることで customs にアクセス可能になる
          include: {
            customs: {
              // customs を含める
              select: {
                // spreadsheetId と spreadsheetUrl を選択
                spreadsheetId: true,
                spreadsheetUrl: true,
              },
            },
          },
        },
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
      polandkillPointLimit: customSetting.polandkillPointLimit, // Poland Ruleキルポイント上限を追加
      polandKillPoint: customSetting.polandKillPoint, // Poland Ruleキルポイントを追加
      defaultTeams: customSetting.defaultTeams, // defaultTeamsを追加
      // スプレッドシート情報を追加
      spreadsheetId: customSetting.customItem?.customs?.spreadsheetId || null,
      spreadsheetUrl: customSetting.customItem?.customs?.spreadsheetUrl || null,
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      // CustomSettingがPlacementPointを参照しているため、CustomSetting削除より前に実行
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

      // 最後にCustomsを削除 (deleteManyに変更)
      await tx.customs.deleteMany({
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
