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

// リクエストボディの型定義 - ポイント設定を再度含める
interface PostRequestBody {
  matchData: MatchDataInput;
  killPoint: number; // リクエストボディから受け取るキルポイント (1キルあたりのポイント)
  placementPoint: number[]; // リクエストボディから受け取る順位ポイント配列
  killPointLimit: number | null; // リクエストボディから受け取るキルポイント上限
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // リクエストボディからmatchDataとポイント設定を取得
    const {
      matchData,
      killPoint, // リクエストボディから取得
      placementPoint, // リクエストボディから取得
      killPointLimit, // リクエストボディから取得
    }: PostRequestBody = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // CustomItem と CustomSetting をDBから取得 (ポイントモードとマッチポイント閾値のため)
      const customItem = await tx.customItem.findFirst({
        where: { customsId: id },
        include: {
          customSetting: true, // PlacementPointはリクエストボディから受け取るため不要
        },
      });

      if (!customItem || !customItem.customSetting) {
        throw new Error(
          "CustomItem or CustomSetting not found for custom ID: " + id
        );
      }

      const customSetting = customItem.customSetting;

      // 計算に使用するポイント設定を決定
      // リクエストボディで受け取った値を優先し、ポイントモードによって適用する値を制御
      let finalKillPoint: number;
      let finalKillPointLimit: number | null;
      let finalPlacementPoints: number[];
      const matchPointThreshold = customSetting.matchPoint; // マッチポイント閾値はDBから取得

      // ALGSまたはPoland Ruleの場合、リクエストボディのキルポイント、上限、順位ポイントを使用
      if (customSetting.algs || customSetting.polandRule) {
        finalKillPoint = killPoint;
        finalKillPointLimit = killPointLimit;
        finalPlacementPoints = placementPoint;
      } else if (customSetting.teamDeathMatch) {
        // TDMモードの場合、リクエストボディのキルポイントと順位ポイントを使用
        // TDMにはキルポイント上限やBR形式の順位ポイントは適用しないと仮定
        finalKillPoint = killPoint;
        finalKillPointLimit = null; // TDMには上限なしと仮定
        finalPlacementPoints = placementPoint; // TDMの順位ポイントもDialogで設定可能になっているため
        // 注意: TDMの順位ポイントは通常2つだけですが、ここでは汎用的に配列として扱います。
        // TDMの計算ロジックは別途調整が必要かもしれません。
      } else {
        // UnknownまたはCustom Ruleの場合、リクエストボディの値をそのまま使用
        finalKillPoint = killPoint;
        finalKillPointLimit = killPointLimit;
        finalPlacementPoints = placementPoint;
      }

      // ログ出力（デバッグ用）
      console.log("Received points from client:", {
        killPoint,
        placementPoint,
        killPointLimit,
      });
      console.log("Calculated points to use:", {
        finalKillPoint,
        finalKillPointLimit,
        finalPlacementPoints,
        matchPointThreshold,
      });

      const customData = await tx.customData.create({
        data: {
          customItemId: customItem.id,
          mapName: matchData.map_name,
          mid: matchData.match_id || "",
          matchStart: matchData.match_start.toString(),
        },
      });

      const teamMap = new Map<
        string,
        { teamNum: number; placement: number; totalKills: number }
      >();

      for (const player of matchData.player_results) {
        // プレイヤーごとのキルポイント計算（プレイヤー個別のキルポイントに上限は適用しない）
        const playerKillPoint = player.kills * finalKillPoint;

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
            killPoint: playerKillPoint, // 上限適用なしのキルポイント
          },
        });

        if (!teamMap.has(player.teamName)) {
          teamMap.set(player.teamName, {
            teamNum: player.teamNum,
            placement: player.teamPlacement,
            totalKills: 0,
          });
        }
        teamMap.get(player.teamName)!.totalKills += player.kills;
      }

      // TeamResultを作成 (winnerはデフォルトのfalseのまま一旦作成)
      const createdTeamResultIds: string[] = [];
      const newMatchTeamResults: {
        name: string;
        placement: number;
        id: string;
        placementPoint: number;
        killPoint: number;
        allPoint: number;
      }[] = []; // TeamResult情報を保持

      for (const [teamName, teamData] of teamMap) {
        // 順位ポイントを計算（配列の範囲外の場合は0）
        const placementPoint_team =
          finalPlacementPoints[teamData.placement - 1] || 0; // finalPlacementPointsを使用

        // チーム合計キルポイント計算
        const rawTeamTotalKillPoint = teamData.totalKills * finalKillPoint;

        // キルポイント上限を適用（上限が設定されている場合のみ）
        const teamTotalKillPoint =
          finalKillPointLimit !== null && finalKillPointLimit !== undefined
            ? Math.min(rawTeamTotalKillPoint, finalKillPointLimit)
            : rawTeamTotalKillPoint;

        const newTeamResult = await tx.teamResult.create({
          data: {
            customDataId: customData.id,
            name: teamName,
            teamNum: teamData.teamNum,
            placement: teamData.placement,
            placementPoint: placementPoint_team,
            killPoint: teamTotalKillPoint, // 上限適用後のキルポイント
            allPoint: placementPoint_team + teamTotalKillPoint, // 上限適用後の合計ポイント
            matchPoint: false, // デフォルトはfalse
            winner: false, // デフォルトはfalse
          },
        });
        createdTeamResultIds.push(newTeamResult.id);
        newMatchTeamResults.push({
          name: newTeamResult.name,
          placement: newTeamResult.placement,
          id: newTeamResult.id,
          placementPoint: newTeamResult.placementPoint,
          killPoint: newTeamResult.killPoint,
          allPoint: newTeamResult.allPoint,
        });
      }

      // --- CustomDataAll & TeamData 保存処理 ---
      // 既存のCustomDataAllがなければ新規作成
      let customDataAll = await tx.customDataAll.findUnique({
        where: { customItemId: customItem.id },
      });
      if (!customDataAll) {
        customDataAll = await tx.customDataAll.create({
          data: {
            customItemId: customItem.id,
          },
        });
      }

      // TeamDataを追加（今回のマッチ分のみ追加）
      for (const team of newMatchTeamResults) {
        await tx.teamData.create({
          data: {
            customDataAllId: customDataAll.id,
            placement: team.placement,
            teamName: team.name,
            placementPoint: Math.round(team.placementPoint),
            killPoint: Math.round(team.killPoint),
            allPoint: Math.round(team.allPoint),
          },
        });
      }
      // --- End CustomDataAll & TeamData 保存処理 ---

      await tx.customs.update({
        where: { id },
        data: {
          itemCount: {
            increment: 1,
          },
        },
      });

      // --- Match Point & Winner Logic ---
      // Poland RuleかつmatchPointThresholdが設定されている場合のみ処理を実行
      if (
        customSetting.polandRule &&
        matchPointThreshold !== null &&
        matchPointThreshold !== undefined
      ) {
        // 現在のカスタム大会の全てのTeamResultを取得して合計ポイントを計算
        const allTeamResults = await tx.teamResult.findMany({
          where: {
            customData: {
              customItem: {
                customsId: id,
              },
            },
          },
        });

        const totalPointsMap = new Map<string, number>();
        allTeamResults.forEach((tr) => {
          const currentTotal = totalPointsMap.get(tr.name) || 0;
          totalPointsMap.set(tr.name, currentTotal + tr.allPoint);
        });

        // Match Point Thresholdを超えたチームを特定
        const teamsAboveThreshold = Array.from(totalPointsMap.entries())
          .filter(
            ([teamName, totalPoints]) => totalPoints >= matchPointThreshold
          )
          .map(([teamName]) => teamName);

        // 今回追加したTeamResultの中で、Match Point Thresholdを超えたチームのmatchPointをtrueに更新
        if (teamsAboveThreshold.length > 0) {
          await tx.teamResult.updateMany({
            where: {
              id: {
                in: createdTeamResultIds, // 今回作成したTeamResultのIDリストを使用
              },
              name: {
                in: teamsAboveThreshold, // Match Point Thresholdを超えたチーム名に一致
              },
            },
            data: {
              matchPoint: true, // matchPointをtrueに設定
            },
          });
        }

        // Winner Logic: Match Point Thresholdを超えたチームが、今回追加されたマッチで1位を取った場合
        const firstPlaceTeamInNewMatch = newMatchTeamResults.find(
          (tr) => tr.placement === 1
        );

        if (
          firstPlaceTeamInNewMatch &&
          teamsAboveThreshold.includes(firstPlaceTeamInNewMatch.name)
        ) {
          await tx.teamResult.update({
            where: {
              id: firstPlaceTeamInNewMatch.id, // 今回作成された1位チームのTeamResultのID
            },
            data: {
              winner: true, // winnerをtrueに設定
            },
          });
        }
      }
      // --- End Match Point & Winner Logic ---

      return { success: true, customDataId: customData.id };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving match data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { error: "マッチデータの保存に失敗しました", details: errorMessage },
      { status: 500 }
    );
  }
}
