"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, SquareArrowUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Apex_demo_playgame_display from "@/public/img/apex_demo_playgame_display.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // セッションを取得するために追加

export default function OverlayComponent() {
  const { data: session } = useSession(); // セッション情報を取得
  const [customTitle, setCustomTitle] = useState("WGR CUP");
  const [matchNumber, setMatchNumber] = useState(1);
  const [scoreBar, setScoreBar] = useState(true);
  const [teamInfo, setTeamInfo] = useState(true);
  const [playerInventory, setPlayerInventory] = useState(true);
  const [teamDestruction, setTeamDestruction] = useState(true);
  const [observerName, setObserverName] = useState(""); // observerNameのstateを追加
  const [iframeKey, setIframeKey] = useState(Date.now()); // iframeを再読み込みするためのキー
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      if (session) {
        try {
          const response = await fetch("/api/overlay");
          if (response.ok) {
            const data = await response.json();
            setCustomTitle(data.overlayCustomName);
            setMatchNumber(data.overlayMatchNumber);
            setScoreBar(data.scoreBar);
            setTeamInfo(data.teamInfo);
            setPlayerInventory(data.playerInventory);
            setTeamDestruction(data.teamDestruction);
            setObserverName(data.observerName || ""); // observerNameをセット
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      }
    };

    fetchSettings();
  }, [session]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/overlay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overlayCustomName: customTitle,
          overlayMatchNumber: matchNumber,
          scoreBar,
          teamInfo,
          playerInventory,
          teamDestruction,
          observerName,
        }),
      });

      if (response.ok) {
        alert("設定が保存されました");
        setIframeKey(Date.now()); // iframeを再読み込み
      } else {
        alert("保存に失敗しました");
      }
    } catch (error) {
      console.error("Error saving overlay settings:", error);
      alert("エラーが発生しました");
    }
  };

  const handleReset = () => {
    setCustomTitle("WGR CUP");
    setMatchNumber(1);
    setScoreBar(true);
    setTeamInfo(true);
    setPlayerInventory(true);
    setTeamDestruction(true);
    setObserverName(""); // observerNameをリセット
  };

  return (
    <div>
      <div className="pt-10 mb-10">
        <style jsx>{`
          .team_info_header_teamname {
            background-image: url("/svg/teamInfo_1.svg");
            object-fit: cover;
            background-size: cover;
            background-position: center;
            color: #ffffff;
            font-size: 1rem;
            width: 100%;
            padding-left: 10px;
          }
        `}</style>
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Settings />
              画面設定
            </CardTitle>
            <CardDescription>
              オーバーレイの設定をすることができます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative"
              style={{ width: "960px", height: "540px", overflow: "hidden" }}
            >
              <Image
                src={Apex_demo_playgame_display}
                alt="Bg Image"
                fill
                className="object-cover"
              />
              <iframe
                key={iframeKey} // keyを追加して再レンダリングをトリガー
                src={`/stream/overlay/${session?.user?.id || "unknown"}`}
                style={{
                  width: "1920px",
                  height: "1080px",
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                  zIndex: 1,
                }}
              />
            </div>
            <div className="mt-5 w-[500px] mx-auto">
              <Label htmlFor="CustomTitle">カスタムタイトル</Label>
              <Input
                id="CustomTitle"
                className=""
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
            <div className="flex justify-center gap-5 mt-5">
              <div className="w-[300px]">
                <p className="text-lg font-semibold w-[130px]">マッチ番号</p>
                <div className="flex items-center gap-3">
                  <p className="font-extrabold">Match</p>
                  <Input
                    className="w-[50px]"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(Number(e.target.value))}
                    readOnly
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setMatchNumber((prev) => prev + 1)}>
                      <SquareArrowUp />
                      Up
                    </Button>
                    <Button
                      onClick={() =>
                        setMatchNumber((prev) => (prev > 1 ? prev - 1 : 1))
                      }
                    >
                      <SquareArrowUp className="transform rotate-180" />
                      Down
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-4 w-[300px]">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ScoreBarSwitch"
                    checked={scoreBar}
                    onCheckedChange={setScoreBar}
                  />
                  <Label htmlFor="ScoreBarSwitch">スコアバー表示</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="TeamInfoSwitch"
                    checked={teamInfo}
                    onCheckedChange={setTeamInfo}
                  />
                  <Label htmlFor="TeamInfoSwitch">チーム情報</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="InventorySwitch"
                    checked={playerInventory}
                    onCheckedChange={setPlayerInventory}
                  />
                  <Label htmlFor="InventorySwitch">インベントリ情報</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="TeamDestructionSwitch"
                    checked={teamDestruction}
                    onCheckedChange={setTeamDestruction}
                  />
                  <Label htmlFor="TeamDestructionSwitch">部隊壊滅情報</Label>
                </div>
              </div>
            </div>
            <div className="mt-5 w-[500px] mx-auto">
              <Label htmlFor="ObserverPlayerName">
                オブザーバープレイヤー名
              </Label>
              <Input
                type="text"
                id="ObserverPlayerName"
                value={observerName}
                onChange={(e) => setObserverName(e.target.value)}
              />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>チーム情報</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-3 gap-4 justify-center items-start mt-5">
                    {[...Array(20)].map((_, teamIndex) => (
                      <div key={teamIndex} className="w-[300px]">
                        <h1 className="team_info_header_teamname flex items-center gap-2 h-10 rounded-t-md">
                          <span>No.{teamIndex + 1}</span>
                          <Input
                            type="text"
                            defaultValue={`Team ${teamIndex + 1}`}
                          />
                        </h1>
                        <div className="bg-white p-3 rounded-b-md space-y-2">
                          {[...Array(3)].map((_, playerIndex) => (
                            <div
                              key={playerIndex}
                              className="flex items-start gap-2"
                            >
                              <div className="space-y-2">
                                <Input
                                  defaultValue={`Player ${playerIndex + 1}`}
                                  className="w-[150px]"
                                  readOnly
                                />
                                <div className="relative">
                                  <label className="cursor-pointer bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition">
                                    ファイルを選択
                                  </label>
                                </div>
                              </div>
                              <div className="w-[110px] h-[110px] border flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                                <span className="text-xs text-center text-gray-500">
                                  画像
                                  <br />
                                  プレビュー
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">入力内容をリセット</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>本当にリセットしますか？</DialogTitle>
                  <DialogDescription>
                    この操作は元に戻せません。これにより、すべての設定が初期状態に戻ります。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={handleReset}
                      type="submit"
                      variant="destructive"
                    >
                      リセット
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSave}>保存</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
