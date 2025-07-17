import dynamic from "next/dynamic";
import ScoreBar from "@/components/scoreBar";
import TeamInfo from "@/components/teamInfo";
import { PrismaClient } from "@prisma/client";
import InventoryClient from "@/components/InventoryClient";

const prisma = new PrismaClient();

interface TeamScore {
  name: string;
  totalPoints: number;
  matchPoint?: boolean;
}

async function getScores(customName: string): Promise<TeamScore[]> {
  if (!customName) {
    return [];
  }
  try {
    const teamResults = await prisma.teamResult.findMany({
      where: {
        customData: {
          customItem: {
            customSetting: {
              customName: customName,
            },
          },
        },
      },
    });

    const scoresMap = new Map<
      string,
      { totalPoints: number; matchPoint: boolean }
    >();

    teamResults.forEach((tr) => {
      if (!scoresMap.has(tr.name)) {
        scoresMap.set(tr.name, { totalPoints: 0, matchPoint: false });
      }
      const current = scoresMap.get(tr.name)!;
      current.totalPoints += tr.allPoint;
      if (tr.matchPoint) {
        current.matchPoint = true;
      }
    });

    const sortedScores: TeamScore[] = Array.from(scoresMap.entries())
      .map(([name, data]) => ({
        name,
        totalPoints: data.totalPoints,
        matchPoint: data.matchPoint,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return sortedScores;
  } catch (error) {
    console.error("Error fetching scores on server:", error);
    return [];
  }
}

export default async function Overlay({ params }: { params: { id: string } }) {
  const { id } = params;

  // DBから設定を取得
  let overlaySettings = await prisma.overlay.findUnique({
    where: { userId: id },
  });

  // DBにデータがない場合は初期値を設定
  if (!overlaySettings) {
    overlaySettings = {
      id: "default", // デフォルトID
      userId: id,
      overlayCustomName: "WGR CUP",
      overlayMatchNumber: 1,
      scoreBar: true,
      teamInfo: true,
      playerInventory: true,
      teamDestruction: true,
      observerName: "", // 追加
    };
  }

  // デフォルト値を設定
  const overlayCustomName = overlaySettings!.overlayCustomName;
  const overlayMatchNumber = overlaySettings!.overlayMatchNumber;
  const scoreBar = overlaySettings!.scoreBar;
  const teamInfo = overlaySettings!.teamInfo;
  const playerInventory = overlaySettings!.playerInventory;
  const teamDestruction = overlaySettings!.teamDestruction;

  const initialScores = await getScores(overlayCustomName);

  return (
    <div className="">
      <div className="w-[1920px] h-[1080px] relative Oswald">
        {/* {teamInfo && (
          <div className="absolute top-0 left-0 w-full h-full">
            <TeamInfo />
          </div>
        )} */}
        {scoreBar && (
          <div className="absolute top-0 left-0 w-full h-full">
            <ScoreBar
              overlayCustomName={overlayCustomName}
              overlayMatchNumber={overlayMatchNumber}
              initialScores={initialScores}
            />
          </div>
        )}
        {playerInventory && (
          <div className="absolute top-0 left-0 w-full h-full">
            <InventoryClient />
          </div>
        )}
      </div>
    </div>
  );
}
