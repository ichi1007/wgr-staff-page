import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customName = searchParams.get("customName");
  const isTotal = searchParams.has("total");

  if (!customName) {
    return NextResponse.json(
      { error: "customName is required" },
      { status: 400 }
    );
  }

  try {
    // 1. customNameからCustomSettingを検索してcustomItemIdを取得
    const customSetting = await prisma.customSetting.findFirst({
      where: { customName },
      select: { customItemId: true, matchPoint: true, polandRule: true },
    });

    if (!customSetting) {
      return NextResponse.json({ error: "Custom not found" }, { status: 404 });
    }

    if (isTotal) {
      // 2. Get all TeamResults for this custom
      const allTeamResults = await prisma.teamResult.findMany({
        where: {
          customData: {
            customItemId: customSetting.customItemId,
          },
        },
        select: {
          name: true,
          allPoint: true,
          placementPoint: true,
          killPoint: true,
          winner: true,
        },
      });

      if (allTeamResults.length === 0) {
        // No results yet, return empty array
        return NextResponse.json([]);
      }

      // 3. Aggregate points and check for winner
      const teamTotals: {
        [key: string]: {
          placementPoint: number;
          killPoint: number;
          allPoint: number;
          winner: boolean;
        };
      } = {};

      allTeamResults.forEach((result) => {
        if (!teamTotals[result.name]) {
          teamTotals[result.name] = {
            placementPoint: 0,
            killPoint: 0,
            allPoint: 0,
            winner: false,
          };
        }
        teamTotals[result.name].placementPoint += result.placementPoint;
        teamTotals[result.name].killPoint += result.killPoint;
        teamTotals[result.name].allPoint += result.allPoint;
        if (result.winner) {
          teamTotals[result.name].winner = true;
        }
      });

      // 4. Convert to array, sort, and determine matchPoint status
      const matchPointThreshold =
        customSetting.polandRule && customSetting.matchPoint != null
          ? customSetting.matchPoint
          : null;

      const sortedTeams = Object.entries(teamTotals)
        .map(([teamName, points]) => ({
          teamName,
          placementPoint: Math.round(points.placementPoint),
          killPoint: Math.round(points.killPoint),
          allPoint: Math.round(points.allPoint),
          winner: points.winner,
          matchPoint:
            matchPointThreshold !== null &&
            points.allPoint >= matchPointThreshold,
        }))
        .sort((a, b) => b.allPoint - a.allPoint)
        .map((team, index) => ({
          ...team,
          placement: index + 1, // Add placement rank
        }));

      return NextResponse.json(sortedTeams);
    }

    // 2. customItemIdを使用して関連するすべてのTeamResultを取得
    const teamResults = await prisma.teamResult.findMany({
      where: {
        customData: {
          customItemId: customSetting.customItemId,
        },
      },
      select: {
        name: true,
        allPoint: true,
        matchPoint: true,
        placementPoint: true,
        killPoint: true,
      },
    });

    // 3. チームごとにポイントとmatchPointを集計
    const teamPoints: {
      [key: string]: {
        totalAllPoint: number;
        matchPoint: boolean;
        totalPlacementPoint: number;
        totalKillPoint: number;
      };
    } = {};
    teamResults.forEach((result) => {
      if (!teamPoints[result.name]) {
        teamPoints[result.name] = {
          totalAllPoint: 0,
          matchPoint: false,
          totalPlacementPoint: 0,
          totalKillPoint: 0,
        };
      }
      teamPoints[result.name].totalAllPoint += result.allPoint;
      teamPoints[result.name].totalPlacementPoint += result.placementPoint;
      teamPoints[result.name].totalKillPoint += result.killPoint;
      if (result.matchPoint) {
        teamPoints[result.name].matchPoint = true;
      }
    });

    // 4. 配列に変換し、合計ポイントで降順にソート
    const sortedTeams = Object.entries(teamPoints)
      .map(
        ([
          name,
          { totalAllPoint, matchPoint, totalPlacementPoint, totalKillPoint },
        ]) => ({
          name,
          totalAllPoint: Math.round(totalAllPoint),
          matchPoint,
          totalPlacementPoint: Math.round(totalPlacementPoint),
          totalKillPoint: Math.round(totalKillPoint),
        })
      )
      .sort((a, b) => b.totalAllPoint - a.totalAllPoint);

    return NextResponse.json(sortedTeams);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
