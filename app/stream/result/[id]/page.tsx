"use client";
import Image from "next/image";
import Result_BG_Image from "@/public/img/Result_BG_Image.png";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface TeamResult {
  name: string;
  placement: number;
  killPoint: number;
  placementPoint: number;
  allPoint: number;
  matchPoint?: boolean;
  winner?: boolean;
}

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const customsId = params?.id as string;
  const [teamResults, setTeamResults] = useState<TeamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchNumber, setMatchNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!customsId) return;

    const fetchResults = async () => {
      const isTotal = searchParams?.get("total") !== null;
      if (isTotal) {
        // 合計データの場合
        const customRes = await fetch(`/api/customs/${customsId}`);
        const custom = await customRes.json();
        const customName = custom.customName;
        const scoresRes = await fetch(
          `/api/scores?customName=${encodeURIComponent(customName)}&total`
        );
        const scores = await scoresRes.json();
        // 20チーム分埋める（不足分は空文字）
        const filledTeams = Array(20)
          .fill("")
          .map((_, i) => {
            const team = scores[i];
            return {
              placement: team?.placement ?? i + 1,
              name: team?.teamName ?? "",
              killPoint: team?.killPoint ?? 0,
              placementPoint: team?.placementPoint ?? 0,
              allPoint: team?.allPoint ?? 0,
              matchPoint: team?.matchPoint ?? false,
              winner: team?.winner ?? false,
            };
          });
        setTeamResults((prev) =>
          JSON.stringify(prev) !== JSON.stringify(filledTeams)
            ? filledTeams
            : prev
        );
        setMatchNumber(null);
      } else {
        const matchesRes = await fetch(`/api/customs/${customsId}/matches`);
        const matches = await matchesRes.json();
        if (!Array.isArray(matches) || matches.length === 0) {
          // マッチデータがない場合はデフォルトチームを取得して表示
          const customRes = await fetch(`/api/customs/${customsId}`);
          const custom = await customRes.json();
          const defaultTeams: string[] = Array.isArray(custom.defaultTeams)
            ? custom.defaultTeams
            : [];
          // 20チーム分のデフォルトチーム名を埋める（不足分は空文字）
          const filledTeams = Array(20)
            .fill("")
            .map((_, i) => ({
              placement: i + 1,
              name: defaultTeams[i] || "",
              killPoint: 0,
              placementPoint: 0,
              allPoint: 0,
            }));
          setTeamResults((prev) =>
            JSON.stringify(prev) !== JSON.stringify(filledTeams)
              ? filledTeams
              : prev
          );
          setMatchNumber(null);
        } else {
          const latestMatchIdx = matches.length - 1;
          const latestMatch = matches[latestMatchIdx];
          const newTeamResults = Array.isArray(latestMatch.teamResult)
            ? latestMatch.teamResult
            : [];
          setTeamResults((prev) =>
            JSON.stringify(prev) !== JSON.stringify(newTeamResults)
              ? newTeamResults
              : prev
          );
          setMatchNumber(latestMatchIdx + 1);
        }
      }
      setLoading(false);
    };

    // 初回フェッチ
    fetchResults();

    // 1秒ごとにデータを再取得
    const interval = setInterval(fetchResults, 1000);

    // クリーンアップ
    return () => clearInterval(interval);
  }, [customsId, searchParams]);

  const leftTeams = teamResults.slice(0, 10);
  const rightTeams = teamResults.slice(10, 20);

  // ローディング時は空欄20チーム分
  const emptyRow = {
    placement: "",
    name: "",
    killPoint: "",
    placementPoint: "",
    allPoint: "",
  };
  const leftDisplay = loading ? Array(10).fill(emptyRow) : leftTeams;
  const rightDisplay = loading ? Array(10).fill(emptyRow) : rightTeams;

  return (
    <div className="w-[1920px] h-[1080px] relative">
      <Image
        src={Result_BG_Image}
        alt="Result BG Image"
        fill
        objectFit="cover"
        className="absolute z-[-1]"
      />
      <div className="absolute z-10 w-full h-full">
        <h1 className="text-white text-8xl oswaldBold text-center py-20">
          {searchParams?.get("total") !== null
            ? "TOTAL RESULT"
            : matchNumber
            ? `MATCH ${matchNumber} RESULT`
            : "MATCH RESULT"}
        </h1>
        <div className="py-3">
          <div className="gap-3 w-full grid grid-cols-2 px-7">
            <div className="bg-[#73abff] grid grid-cols-6 text-black text-2xl font-bold text-center py-4">
              <p className="oswaldBold">順位</p>
              <p className="col-span-2 oswaldBold">チーム名</p>
              <p className="oswaldBold">KILL</p>
              <p className="oswaldBold">順位PT</p>
              <p className="oswaldBold">TOTAL</p>
            </div>
            <div className="bg-[#73abff] grid grid-cols-6 text-black text-2xl font-bold text-center py-4">
              <p className="oswaldBold">順位</p>
              <p className="col-span-2 oswaldBold">チーム名</p>
              <p className="oswaldBold">KILL</p>
              <p className="oswaldBold">順位PT</p>
              <p className="oswaldBold">TOTAL</p>
            </div>
          </div>
          <div className="gap-3 w-full grid grid-cols-2 px-7 py-1">
            <div>
              {leftDisplay.map((team, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-[#dadada]" : "bg-[#ffffff]"
                  } grid grid-cols-6 text-black text-2xl text-center h-[56px] flex items-center my-2`}
                >
                  <p className="oswald">{team.placement}</p>
                  <p className="col-span-2 oswald">{team.name}</p>
                  <p className="oswald">{team.killPoint}</p>
                  <p className="oswald">{team.placementPoint}</p>
                  <p
                    className={`oswald
                      ${
                        team.winner
                          ? "text-red-600 font-extrabold"
                          : team.matchPoint
                          ? "text-yellow-500 font-extrabold"
                          : ""
                      }
                    `}
                  >
                    {team.allPoint}
                  </p>
                </div>
              ))}
            </div>
            <div>
              {rightDisplay.map((team, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-[#dadada]" : "bg-[#ffffff]"
                  } grid grid-cols-6 text-black text-2xl text-center h-[56px] flex items-center my-2`}
                >
                  <p className="oswald">{team.placement}</p>
                  <p className="col-span-2 oswald">{team.name}</p>
                  <p className="oswald">{team.killPoint}</p>
                  <p className="oswald">{team.placementPoint}</p>
                  <p
                    className={`oswald
                      ${
                        team.winner
                          ? "text-red-600 font-extrabold"
                          : team.matchPoint
                          ? "text-yellow-500 font-extrabold"
                          : ""
                      }
                    `}
                  >
                    {team.allPoint}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
