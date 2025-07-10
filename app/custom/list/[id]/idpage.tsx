"use client";
import { useParams } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import conversionDataRaw from "@/components/Conversion.json";

// Conversion.jsonの型を定義
interface ConversionData {
  map: Record<string, string>;
}

const conversionData: ConversionData = conversionDataRaw;

// プレイヤーの型を定義変換
interface PlayerResult {
  nidHash: string;
  kills: number;
  playerName: string;
  teamName: string;
  hits: number;
  headshots: number;
  knockdowns: number;
  revivesGiven: number;
  respawnsGiven: number;
  survivalTime: number;
  assists: number;
  damageDealt: number;
  teamPlacement: number;
  hardware: string;
  teamNum: number;
  characterName: string;
  shots: number;
}

export default function CustomIdPageComp() {
  const id = useParams().id;
  const router = useRouter();
  const [customName, setCustomName] = useState("");
  const [pointRule, setPointRule] = useState("");
  const [algsRankPoints, setAlgsRankPoints] = useState<number[]>(
    Array(20).fill(0)
  );
  const [dialogStep, setDialogStep] = useState(1);
  const [killPoint, setKillPoint] = useState(1);
  const [statsCode, setStatsCode] = useState("");
  const [matchData, setMatchData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [savedMatches, setSavedMatches] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchPoint, setMatchPoint] = useState<number | null>(null); // matchPointを追加

  useEffect(() => {
    async function fetchCustomData() {
      try {
        const response = await axios.get(`/api/customs/${id}`);
        const data = response.data;
        setCustomName(data.customName);

        // ポイントルールを判定
        if (data.algs) {
          setPointRule("ALGS");
        } else if (data.polandRule) {
          setPointRule("Poland Rule");
        } else if (data.teamDeathMatch) {
          setPointRule("Team Death Match");
        } else {
          setPointRule("Unknown");
        }

        // 設定済みのキルポイントを設定
        if (data.killPoint) {
          setKillPoint(data.killPoint);
        }

        // matchPointを設定
        if (data.matchPoint !== null && data.matchPoint !== undefined) {
          setMatchPoint(data.matchPoint);
        }

        // 設定済みのプレースメントポイントを設定
        if (data.placementPoint) {
          const placementPoints = [
            data.placementPoint.place1,
            data.placementPoint.place2,
            data.placementPoint.place3,
            data.placementPoint.place4,
            data.placementPoint.place5,
            data.placementPoint.place6,
            data.placementPoint.place7,
            data.placementPoint.place8,
            data.placementPoint.place9,
            data.placementPoint.place10,
            data.placementPoint.place11,
            data.placementPoint.place12,
            data.placementPoint.place13,
            data.placementPoint.place14,
            data.placementPoint.place15,
            data.placementPoint.place16,
            data.placementPoint.place17,
            data.placementPoint.place18,
            data.placementPoint.place19,
            data.placementPoint.place20,
          ];
          setAlgsRankPoints(placementPoints);
        }
      } catch (error) {
        console.error("Error fetching custom data:", error);
      }
    }
    fetchCustomData();
  }, [id]);

  // 保存されたマッチデータを取得
  const fetchSavedMatches = async () => {
    try {
      const response = await axios.get(`/api/customs/${id}/matches`);
      setSavedMatches(response.data);

      // 合計結果を計算
      calculateTotalResults(response.data);
    } catch (error) {
      console.error("Error fetching saved matches:", error);
    }
  };

  // 合計結果を計算
  const calculateTotalResults = (matches: any[]) => {
    const teamTotals = new Map<string, any>();

    matches.forEach((match) => {
      match.teamResult.forEach((team: any) => {
        if (!teamTotals.has(team.name)) {
          teamTotals.set(team.name, {
            name: team.name,
            totalPlacementPoint: 0,
            totalKillPoint: 0,
            totalAllPoint: 0,
            matchCount: 0,
          });
        }

        const teamData = teamTotals.get(team.name);
        teamData.totalPlacementPoint += team.placementPoint;
        teamData.totalKillPoint += team.killPoint;
        teamData.totalAllPoint += team.allPoint;
        teamData.matchCount += 1;
      });
    });

    // 合計ポイントでソート、同率の場合は順位ポイントでソート
    const sortedResults = Array.from(teamTotals.values()).sort((a, b) => {
      if (b.totalAllPoint !== a.totalAllPoint) {
        return b.totalAllPoint - a.totalAllPoint;
      }
      return b.totalPlacementPoint - a.totalPlacementPoint;
    });

    setTotalResults(sortedResults);
  };

  useEffect(() => {
    fetchSavedMatches();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/customs/${id}`);
      router.push("/custom/list"); // 削除後にリストページへリダイレクト
    } catch (error) {
      console.error("Error deleting custom:", error);
    }
  };

  const handleNextStep = () => {
    setDialogStep(2);
  };

  const handleBackStep = () => {
    setDialogStep(1);
  };

  const handleDialogClose = () => {
    setDialogStep(1);
    setStatsCode("");
    setIsDialogOpen(false); // Dialogを閉じる
  };

  const handleFetchMatchData = async () => {
    if (!statsCode.trim()) return;

    try {
      setIsLoading(true);
      setHasFetched(false); // 取得開始時にリセット
      const response = await axios.get(`/api/match/${statsCode}`);
      setMatchData(response.data.matches || []);
      setHasFetched(true); // データ取得済みに設定
    } catch (error) {
      console.error("Error fetching match data:", error);
      setMatchData([]);
      setHasFetched(true); // データ取得済みに設定
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = async (match: any) => {
    try {
      setIsLoading(true);

      // マッチデータをDBに保存（プレースメントポイントは設定済みのものを使用）
      const response = await axios.post(`/api/customs/${id}/match`, {
        matchData: match,
        killPoint: killPoint,
      });

      if (response.data.success) {
        setSelectedMatch(match);
        console.log("Match saved successfully:", response.data);

        // 最新データを再取得
        await fetchSavedMatches();

        // Dialogを閉じる
        handleDialogClose();
      }
    } catch (error) {
      console.error("Error saving match:", error);
      alert("マッチデータの保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // マップ名を取得する関数
  const getMapName = (mapKey: string): string => {
    // Conversion.jsonのデータを使用してマップ名を取得
    return conversionData.map[mapKey] || "マップ不明";
  };

  // マッチを削除する関数
  const handleDeleteMatch = async (matchId: string) => {
    try {
      setIsLoading(true);

      // マッチデータを削除
      const response = await axios.delete(
        `/api/customs/${id}/matches/${matchId}`
      );
      if (response.status === 200) {
        console.log("Match deleted successfully:", response.data);

        // 最新データを再取得
        await fetchSavedMatches();
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("マッチデータの削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 mb-5">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>
            <div className="text-2xl">
              {customName ? (
                <p className="text-3xl">{customName}</p>
              ) : (
                <Skeleton className="h-7 w-48" />
              )}
              <div>
                <p className="text-sm">
                  ポイントルール：<span>{pointRule}</span>
                </p>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            マッチの詳細情報を表示します。
            <br />
            PP = 順位ポイント、KP = キルポイント、ALL = 合計ポイント
          </CardDescription>
          <CardAction className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                  <div className="flex items-center gap-2">
                    <Plus />
                    マッチ追加
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {dialogStep === 1 ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        <div className="flex items-center gap-2">
                          <Plus />
                          マッチ追加
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        ポイントを設定の上、マッチを追加してください。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-5 grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-1">順位ポイント</Label>
                        <Dialog>
                          <DialogTrigger asChild className="w-24">
                            <Button>変更する</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>順位ポイント設定</DialogTitle>
                              <DialogDescription>
                                順位ごとのポイントを設定できます。
                              </DialogDescription>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="flex flex-col gap-2">
                                  {/* 1位〜10位 */}
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between border rounded px-3 py-1 bg-white"
                                    >
                                      <span>{i + 1}位:</span>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          className="w-16 h-8 text-right"
                                          value={algsRankPoints[i]}
                                          min={0}
                                          onChange={(e) => {
                                            const newPoints = [
                                              ...algsRankPoints,
                                            ];
                                            newPoints[i] = Number(
                                              e.target.value
                                            );
                                            setAlgsRankPoints(newPoints);
                                          }}
                                        />
                                        pt
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex flex-col gap-2">
                                  {/* 11位〜20位 */}
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between border rounded px-3 py-1 bg-white"
                                    >
                                      <span>{i + 11}位:</span>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          className="w-16 h-8 text-right"
                                          value={algsRankPoints[i + 10]}
                                          min={0}
                                          onChange={(e) => {
                                            const newPoints = [
                                              ...algsRankPoints,
                                            ];
                                            newPoints[i + 10] = Number(
                                              e.target.value
                                            );
                                            setAlgsRankPoints(newPoints);
                                          }}
                                        />
                                        pt
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div>
                        <Label className="mb-2">キルポイント</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={killPoint}
                            min={0}
                            onChange={(e) =>
                              setKillPoint(Number(e.target.value))
                            }
                          />
                          pt
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleNextStep} disabled={isLoading}>
                        次へ
                        <ArrowRight />
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        <div className="flex items-center gap-2">
                          <Plus />
                          スタッツコード入力
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        スタッツコードを入力してマッチを選択してください。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-5 grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="stats-code">スタッツコード</Label>
                        <div className="flex gap-2">
                          <Input
                            id="stats-code"
                            type="text"
                            placeholder="スタッツコードを入力してください"
                            value={statsCode}
                            onChange={(e) => setStatsCode(e.target.value)}
                          />
                          <Button
                            onClick={handleFetchMatchData}
                            disabled={isLoading || !statsCode.trim()}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "取得"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <ScrollArea className="h-[300px] w-full border rounded-md p-4">
                          {matchData.length > 0 ? (
                            <div className="space-y-2">
                              {matchData.map((match, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleSelectMatch(match)}
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      マッチ {index + 1}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {format(
                                        new Date(match.match_start * 1000),
                                        "yyyy/MM/dd HH:mm"
                                      )}{" "}
                                      - {getMapName(match.map_name)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {match.player_results.length} プレイヤー
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      チーム数:{" "}
                                      {
                                        new Set(
                                          match.player_results.map(
                                            (player: PlayerResult) =>
                                              player.teamName
                                          )
                                        ).size
                                      }
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            hasFetched && (
                              <div className="text-center p-8 text-gray-500">
                                マッチデータが見つかりませんでした
                              </div>
                            )
                          )}
                        </ScrollArea>

                        {isLoading && (
                          <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-white bg-opacity-75 border rounded-md">
                            <p>データを取得中...</p>
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={handleBackStep}
                        disabled={isLoading}
                      >
                        戻る
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ChevronDown />
                  その他
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>その他の操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>デフォルトチームを設定</DropdownMenuItem>
                  <DropdownMenuItem>
                    デフォルトの順位ポイント変更
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    デフォルトのキルポイント変更
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>本当に削除しますか？</DialogTitle>
                  <DialogDescription>
                    この操作は取り消せません。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete}>
                    削除する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="total" className="w-full">
            <TabsList>
              <TabsTrigger value="total">合計</TabsTrigger>
              {savedMatches.map((match, index) => (
                <TabsTrigger key={match.id} value={`match_${index + 1}`}>
                  マッチ{index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="total">
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  合計 {matchPoint !== null && `(マッチポイント: ${matchPoint}pt)`}
                </h3>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                <p>順位</p>
                <p>チーム名</p>
                <p>PP</p>
                <p>KP</p>
                <p>ALL</p>
              </div>
              {totalResults.map((team, index) => {
                const isAboveThreshold =
                  matchPoint !== null && team.totalAllPoint >= matchPoint;

                return (
                  <div
                    key={team.name}
                    className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3"
                  >
                    <p>{index + 1}</p>
                    <p>{team.name}</p>
                    <p>{team.totalPlacementPoint}</p>
                    <p>{team.totalKillPoint}</p>
                    <p className={isAboveThreshold ? "text-red-600" : ""}>
                      {team.totalAllPoint}
                    </p>
                  </div>
                );
              })}
            </TabsContent>

            {savedMatches.map((match, index) => (
              <TabsContent key={match.id} value={`match_${index + 1}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">マッチ{index + 1}</h3>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMatch(match.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    マッチを削除
                  </Button>
                </div>
                <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                  <p>順位</p>
                  <p>チーム名</p>
                  <p>PP</p>
                  <p>KP</p>
                  <p>ALL</p>
                </div>
                {match.teamResult.map((team: any, teamIndex: number) => (
                  <div
                    key={team.id}
                    className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3"
                  >
                    <p>{team.placement}</p>
                    <p>{team.name}</p>
                    <p>{team.placementPoint}</p>
                    <p>{team.killPoint}</p>
                    <p>{team.allPoint}</p>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
