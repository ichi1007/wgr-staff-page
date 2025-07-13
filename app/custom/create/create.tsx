"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine, Pickaxe, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function CreateCustomPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pointMode, setPointMode] = useState<string>("algs");
  const [customName, setCustomName] = useState<string>("");
  const [defaultTeamsInput, setDefaultTeamsInput] = useState<string>(""); // デフォルトチーム入力用のstateを追加
  const [algsKillCap, setAlgsKillCap] = useState<string>("1000");
  const [algsKillPoint, setAlgsKillPoint] = useState<string>("1");
  const [polandKillPoint, setPolandKillPoint] = useState<string>("1");
  const [polandMatchPoint, setPolandMatchPoint] = useState<string>("50");
  const [tdmKillPoint, setTdmKillPoint] = useState<string>("1");
  // 順位ポイントは配列で管理
  const defaultRankPoints = {
    algs: [
      ...[12, 9, 7, 5, 4, 3, 3, 2, 2, 2], // 1-10位
      ...[1, 1, 1, 1, 1, 0, 0, 0, 0, 0], // 11-20位
    ],
    tdm: [12, 9], // 1-2位
  };
  const [algsRankPoints, setAlgsRankPoints] = useState<number[]>([
    ...defaultRankPoints.algs,
  ]);
  const [tdmRankPoints, setTdmRankPoints] = useState<number[]>([
    ...defaultRankPoints.tdm,
  ]);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // デフォルトチーム textarea の入力変更ハンドラ
  const handleDefaultTeamsInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDefaultTeamsInput(e.target.value);
  };

  // JSON ファイルアップロードハンドラ
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const parsedData = JSON.parse(jsonContent);

        let teamNames: string[] = [];

        if (Array.isArray(parsedData)) {
          // JSONがチーム名の配列の場合
          teamNames = parsedData.map((item) => String(item));
        } else if (typeof parsedData === "object" && parsedData !== null) {
          // JSONが { "1": "チームA", "2": "チームB" } のようなオブジェクトの場合
          // キーを数値としてソートし、値を抽出
          teamNames = Object.keys(parsedData)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => String(parsedData[key]));
        } else {
          throw new Error("Unsupported JSON format.");
        }

        // 抽出したチーム名を改行区切りでtextareaにセット
        setDefaultTeamsInput(teamNames.join("\n"));
      } catch (error) {
        console.error("Error reading or parsing JSON file:", error);
        alert(
          "JSONファイルの読み込みまたはパースに失敗しました。形式を確認してください。"
        );
        setDefaultTeamsInput(""); // エラー時は入力をクリア
      } finally {
        // 同じファイルを再度選択できるようにファイル入力の値をリセット
        e.target.value = "";
      }
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      alert("ファイルの読み込み中にエラーが発生しました。");
      setDefaultTeamsInput(""); // エラー時は入力をクリア
      // ファイル入力の値をリセット
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customName.trim()) {
      alert("カスタム名を入力してください");
      return;
    }

    setIsSubmitting(true);

    // デフォルトチームの入力値を改行で分割し、空行を除去して配列にする
    const defaultTeamsArray = defaultTeamsInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    // Note: defaultTeam スキーマは固定フィールド名 (team1Name, team2Name, ...) です。
    // この配列を適切なスキーマフィールドにマッピングするか、関連する defaultTeam エントリを作成する処理は
    // バックエンドAPI (/api/customs) で行う必要があります。
    // このUI変更では、ペイロードに配列を含めるだけです。
    // デフォルトチームを保存するためのバックエンド実装はこのリクエストの範囲外です。

    try {
      const response = await fetch("/api/customs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customName,
          pointMode,
          algsKillCap,
          algsKillPoint,
          algsRankPoints,
          polandKillPoint,
          polandMatchPoint,
          tdmKillPoint,
          tdmRankPoints,
          defaultTeams: defaultTeamsArray, // デフォルトチームのデータをペイロードに含める
        }),
      });

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      const result = await response.json();
      // リダイレクト状態に変更
      setIsSubmitting(false);
      setIsRedirecting(true);
      // 直接詳細ページに移動
      window.location.href = `/custom/list/${result.customsId}`;
    } catch (error) {
      console.error("Error saving custom:", error);
      alert("保存に失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  };

  // リセット処理
  const handleReset = () => {
    setPointMode("algs");
    setCustomName("");
    setDefaultTeamsInput(""); // デフォルトチーム入力をリセット
    setAlgsKillCap("1000");
    setAlgsKillPoint("1");
    setPolandKillPoint("1");
    setPolandMatchPoint("50");
    setTdmKillPoint("1");
    setAlgsRankPoints([...defaultRankPoints.algs]);
    setTdmRankPoints([...defaultRankPoints.tdm]);
  };

  return (
    <div className="mb-13 pt-20">
      <div className="w-full max-w-3xl mx-auto mb-3">
        <h2 className="text-center font-extrabold text-xl flex items-center justify-center gap-2">
          <PencilLine />
          情報を入力
        </h2>
      </div>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Pickaxe />
            新規カスタムを作成
          </CardTitle>
          <CardDescription>
            <ul className="list-disc pl-5">
              <li>作成後は、カスタムの詳細ページに移動します。</li>
              <li>ポイント設定はデフォルトでALGS形式です。</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="custom_name">
                  {" "}
                  {/* htmlForを修正 */}
                  カスタム名<span className="text-red-500 text-xs">必須</span>
                </Label>
                <Input
                  id="custom_name"
                  type="text"
                  placeholder="WGR CUP"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="default_teams">デフォルトチーム</Label>{" "}
                {/* htmlForを追加 */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="my-1">
                      追加する
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>デフォルトチーム</DialogTitle>
                      <DialogDescription>
                        デフォルトで表示されるチームを追加します。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-96 max-h-96">
                      <Textarea
                        placeholder={`カンマ区切り\nチーム1,チーム2,チーム3, ...\n\n改行区切り\nチーム1\nチーム2\nチーム3\n...\n\n読点区切り\nチーム1、チーム2、チーム3、 ...\n\nJson形式\n{ \n  "1": "チーム1",\n  "2": "チーム2",\n  "3": "チーム3"\n}`}
                        className="h-full resize-none"
                        value={defaultTeamsInput} // stateと紐づけ
                        onChange={handleDefaultTeamsInputChange} // ハンドラを設定
                      />
                    </div>
                    <DialogFooter>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label
                            htmlFor="json-file-upload"
                            className="flex items-center gap-2 cursor-pointer px-4 py-2 border text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <Input
                              id="json-file-upload"
                              type="file"
                              className="sr-only"
                              accept=".json" // JSONファイルのみ受け付けるように指定
                              onChange={handleJsonFileUpload} // ハンドラを設定
                            />
                            Jsonで追加
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            ・ファイルを持っている方
                            <br />
                            ・有識者向け
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <DialogClose asChild>
                        <Button variant="default">閉じる</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="point_mode">
                  {" "}
                  {/* htmlForを修正 */}
                  ポイントモード
                  <span className="text-red-500 text-xs">必須</span>
                </Label>
                <Select required value={pointMode} onValueChange={setPointMode}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algs">ALGS</SelectItem>
                    <SelectItem value="poland">Poland Rule</SelectItem>
                    <SelectItem value="tdm">Team Death Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {pointMode === "algs" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="algs_kill_cap">
                      {" "}
                      {/* htmlForを修正 */}
                      キルポイント上限
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用される値
                      </span>
                    </Label>
                    <Select
                      required
                      value={algsKillCap}
                      onValueChange={setAlgsKillCap}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">上限なし</SelectItem>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="13">13</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="17">17</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                        <SelectItem value="19">19</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="algs_kill_point">
                      {" "}
                      {/* htmlForを修正 */}
                      キルポイント
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用される値
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="algs_kill_point" // idを修正
                        type="number"
                        value={algsKillPoint}
                        onChange={(e) => setAlgsKillPoint(e.target.value)}
                        required
                        className="w-24"
                      />
                      <p>pt</p>
                    </div>
                  </div>
                </>
              )}
              {pointMode === "poland" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="poland_kill_point">
                      {" "}
                      {/* htmlForを修正 */}
                      キルポイント
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用される値
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="poland_kill_point" // idを修正
                        type="number"
                        value={polandKillPoint}
                        onChange={(e) => setPolandKillPoint(e.target.value)}
                        required
                        className="w-24"
                      />
                      <p>pt</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="poland_kill_point_limit">
                      {" "}
                      {/* htmlForを修正 */}
                      キルポイント上限
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用される値
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="poland_kill_point_limit" // idを修正
                        type="number"
                        defaultValue="9999" // state管理していないが、idとhtmlForを修正
                        required
                        className="w-24"
                      />
                      <p>pt</p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="poland_match_point">
                      {" "}
                      {/* htmlForを修正 */}
                      マッチポイント
                      <span className="text-red-500 text-xs">必須</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="poland_match_point" // idを修正
                        type="number"
                        value={polandMatchPoint}
                        onChange={(e) => setPolandMatchPoint(e.target.value)}
                        required
                        className="w-24"
                      />
                      <p>pt</p>
                    </div>
                  </div>
                </>
              )}
              {pointMode === "tdm" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="tdm_kill_point">
                      {" "}
                      {/* htmlForを修正 */}
                      キルポイント
                      <span className="text-red-500 text-xs">必須</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tdm_kill_point" // idを修正
                        type="number"
                        value={tdmKillPoint}
                        onChange={(e) => setTdmKillPoint(e.target.value)}
                        required
                        className="w-24"
                      />
                      <p>pt</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tdm_rank_points">
                      {" "}
                      {/* htmlForを修正 */}
                      Team Death Match順位ポイント
                      <span className="text-red-500 text-xs">必須</span>
                    </Label>
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
                              {/* 1位〜2位 */}
                              {[...Array(2)].map((_, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between border rounded px-3 py-1 bg-white"
                                >
                                  <span>{i + 1}位:</span>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      className="w-16 h-8 text-right"
                                      value={tdmRankPoints[i]}
                                      min={0}
                                      onChange={(e) => {
                                        const newPoints = [...tdmRankPoints];
                                        newPoints[i] = Number(e.target.value);
                                        setTdmRankPoints(newPoints);
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
                </>
              )}
              {(pointMode === "algs" || pointMode === "poland") && (
                <div className="grid gap-2">
                  <Label htmlFor="algs_rank_points">
                    {" "}
                    {/* htmlForを修正 */}
                    順位ポイント
                    <span className="text-red-500 text-xs">必須</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      デフォルトで使用される値
                    </span>
                  </Label>
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
                                      const newPoints = [...algsRankPoints];
                                      newPoints[i] = Number(e.target.value);
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
                                      const newPoints = [...algsRankPoints];
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
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isRedirecting}
            onClick={handleSubmit}
          >
            <Save />
            {isSubmitting
              ? "保存中..."
              : isRedirecting
              ? "移動中..."
              : "保存して詳細ページへ"}
          </Button>
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isSubmitting || isRedirecting}
                onClick={() => setShowResetDialog(true)}
              >
                <Trash2 className="text-red-500" />
                記入内容をリセット
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>リセットの確認</DialogTitle>
                <DialogDescription>
                  入力内容をすべてリセットします。よろしいですか？
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(false)}
                  type="button"
                  disabled={isSubmitting || isRedirecting}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleReset();
                    setShowResetDialog(false);
                  }}
                  type="button"
                  disabled={isSubmitting || isRedirecting}
                >
                  リセットする
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

