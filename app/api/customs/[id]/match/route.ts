import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PlayerResultInput {
  teamNum: number;
  teamName: string;
  teamPlacement: number;
  playerName: string;
  characterName: string;
  kills: number;
  assists: number;
  damageDealt: number;
  shots: number;
  hits: number;
  nidHash: string;
  headshots: number;
  knockdowns: number;
  revivesGiven: number;
  respawnsGiven: number;
  survivalTime: number;
  hardware: string;
}

interface MatchDataInput {
  map_name: string;
  match_id: string;
  match_start: number;
  player_results: PlayerResultInput[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      matchData,
      killPoint,
    }: { matchData: MatchDataInput; killPoint: number } = await request.json();

    // トランザクションでマッチデータを保存
    const result = await prisma.$transaction(async (tx) => {
      // CustomItemとCustomSettingを取得
      const customItem = await tx.customItem.findFirst({
        where: { customsId: id },
        include: {
          customSetting: {
            include: {
              placementPoint: true,
            },
          },
        },
      });

      if (!customItem || !customItem.customSetting) {
        throw new Error("CustomItem or CustomSetting not found");
      }

      // PlacementPointを配列に変換
      const placementPoints = customItem.customSetting.placementPoint
        ? [
            customItem.customSetting.placementPoint.place1,
            customItem.customSetting.placementPoint.place2,
            customItem.customSetting.placementPoint.place3,
            customItem.customSetting.placementPoint.place4,
            customItem.customSetting.placementPoint.place5,
            customItem.customSetting.placementPoint.place6,
            customItem.customSetting.placementPoint.place7,
            customItem.customSetting.placementPoint.place8,
            customItem.customSetting.placementPoint.place9,
            customItem.customSetting.placementPoint.place10,
            customItem.customSetting.placementPoint.place11,
            customItem.customSetting.placementPoint.place12,
            customItem.customSetting.placementPoint.place13,
            customItem.customSetting.placementPoint.place14,
            customItem.customSetting.placementPoint.place15,
            customItem.customSetting.placementPoint.place16,
            customItem.customSetting.placementPoint.place17,
            customItem.customSetting.placementPoint.place18,
            customItem.customSetting.placementPoint.place19,
            customItem.customSetting.placementPoint.place20,
          ]
        : Array(20).fill(0);

      // 設定されたキルポイントを使用
      const settingKillPoint = customItem.customSetting.killPoint || killPoint;

      // CustomDataを作成
      const customData = await tx.customData.create({
        data: {
          customItemId: customItem.id,
          mapName: matchData.map_name,
          mid: matchData.match_id || "",
          matchStart: matchData.match_start.toString(),
        },
      });

      // プレイヤーデータをチーム別に集計
      const teamMap = new Map<
        string,
        { teamNum: number; placement: number; totalKills: number }
      >(); // 型を明確化

      // PlayerResultを作成
      for (const player of matchData.player_results) {
        await tx.playerResult.create({
          data: {
            customDataId: customData.id,
            teamNum: player.teamNum,
            teamName: player.teamName,
            teamPlacement: player.teamPlacement,
            playerName: player.playerName,
            characterName: player.characterName,
            kill: player.kills,
            assists: player.assists,
            damage: player.damageDealt,
            shots: player.shots,
            hits: player.hits,
            killPoint: player.kills * settingKillPoint,
          },
        });

        // チームデータを集計
        if (!teamMap.has(player.teamName)) {
          teamMap.set(player.teamName, {
            teamNum: player.teamNum,
            placement: player.teamPlacement,
            totalKills: 0,
          });
        }
        teamMap.get(player.teamName)!.totalKills += player.kills; // 非nullアサーションを追加
      }

      // TeamResultを作成
      for (const [teamName, teamData] of teamMap) {
        const placementPoint = placementPoints[teamData.placement - 1] || 0;
        const killPoint_team = teamData.totalKills * settingKillPoint;

        await tx.teamResult.create({
          data: {
            customDataId: customData.id,
            name: teamName,
            teamNum: teamData.teamNum,
            placement: teamData.placement,
            placementPoint: placementPoint,
            killPoint: killPoint_team,
            allPoint: placementPoint + killPoint_team,
          },
        });
      }

      // CustomsのitemCountを更新
      await tx.customs.update({
        where: { id },
        data: {
          itemCount: {
            increment: 1,
          },
        },
      });

      return { success: true, customDataId: customData.id };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving match data:", error);
    return NextResponse.json(
      { error: "マッチデータの保存に失敗しました" },
      { status: 500 }
    );
  }
}
