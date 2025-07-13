import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      customName,
      pointMode,
      algsKillCap, // ALGSのキルポイント上限
      algsKillPoint,
      algsRankPoints,
      polandKillPoint,
      polandMatchPoint,
      polandkillPointLimit, // Poland Ruleのキルポイント上限を追加
      tdmKillPoint,
      tdmRankPoints,
      defaultTeams, // defaultTeams を受け取る
    } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // Customsテーブルにデータを作成
      const customs = await tx.customs.create({
        data: {
          itemCount: 0, // 初期値
        },
      });

      // CustomItemを作成
      const customItem = await tx.customItem.create({
        data: {
          customsId: customs.id,
        },
      });

      // PlacementPointを作成（ALGSまたはPolandの場合）
      let placementPointId: string | null = null;
      if (pointMode === "algs" || pointMode === "poland") {
        const placementPoint = await tx.placementPoint.create({
          data: {
            place1: algsRankPoints[0] || 0,
            place2: algsRankPoints[1] || 0,
            place3: algsRankPoints[2] || 0,
            place4: algsRankPoints[3] || 0,
            place5: algsRankPoints[4] || 0,
            place6: algsRankPoints[5] || 0,
            place7: algsRankPoints[6] || 0,
            place8: algsRankPoints[7] || 0,
            place9: algsRankPoints[8] || 0,
            place10: algsRankPoints[9] || 0,
            place11: algsRankPoints[10] || 0,
            place12: algsRankPoints[11] || 0,
            place13: algsRankPoints[12] || 0,
            place14: algsRankPoints[13] || 0,
            place15: algsRankPoints[14] || 0,
            place16: algsRankPoints[15] || 0,
            place17: algsRankPoints[16] || 0,
            place18: algsRankPoints[17] || 0,
            place19: algsRankPoints[18] || 0,
            place20: algsRankPoints[19] || 0,
          },
        });
        placementPointId = placementPoint.id;
      }

      // CustomSettingを作成
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customSettingData: any = {
        customItemId: customItem.id,
        customName: customName || "",
        defaultTeams:
          defaultTeams && Array.isArray(defaultTeams) ? defaultTeams : [], // defaultTeams配列を直接保存

        algs: pointMode === "algs",
        polandRule: pointMode === "poland",
        teamDeathMatch: pointMode === "tdm",

        // ポイントモードに応じてキルポイントとキルポイント上限を設定
        killPointLimit:
          pointMode === "algs" ? parseInt(algsKillCap || "0") : null, // ALGSの場合のみ設定
        killPoint: pointMode === "algs" ? parseInt(algsKillPoint || "0") : null, // ALGSの場合のみ設定
        placementPointId: placementPointId, // ALGS/Polandの場合のみ設定

        polandKillPoint:
          pointMode === "poland" ? parseInt(polandKillPoint || "0") : null, // Polandの場合のみ設定
        matchPoint:
          pointMode === "poland" ? parseInt(polandMatchPoint || "0") : null, // Polandの場合のみ設定
        polandkillPointLimit:
          pointMode === "poland" ? parseInt(polandkillPointLimit || "0") : null, // Polandの場合のみ設定

        tdmKillPoint:
          pointMode === "tdm" ? parseInt(tdmKillPoint || "0") : null, // TDMの場合のみ設定
        tdmPoint1: pointMode === "tdm" ? tdmRankPoints[0] || 0 : null, // TDMの場合のみ設定
        tdmPoint2: pointMode === "tdm" ? tdmRankPoints[1] || 0 : null, // TDMの場合のみ設定
      };

      await tx.customSetting.create({
        data: customSettingData,
      });

      return { customsId: customs.id, customItemId: customItem.id };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating custom:", error);
    return NextResponse.json(
      { error: "カスタムの作成に失敗しました" },
      { status: 500 }
    );
  }
}
