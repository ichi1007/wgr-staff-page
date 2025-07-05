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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine, Pickaxe, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CreateCustomPage() {
  const [pointMode, setPointMode] = useState<string>("algs");
  const [customName, setCustomName] = useState<string>("");
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

  // リセット処理
  const handleReset = () => {
    setPointMode("algs");
    setCustomName("");
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
        <Progress value={10} />
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
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="text">
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
              <div className="grid gap-2">
                <Label htmlFor="password">
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
                    <SelectItem value="Tournament">Tournament Rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {pointMode === "algs" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      キルポイント上限
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用、最初に追加したマッチに適用されます。
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
                    <Label htmlFor="password">
                      キルポイント
                      <span className="text-red-500 text-xs">必須</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="kill_point"
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
                    <Label htmlFor="password">
                      キルポイント
                      <span className="text-red-500 text-xs">必須</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="kill_point"
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
                    <Label htmlFor="password">
                      PolandRuleマッチポイント
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用、最初に追加したマッチに適用されます。
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="kill_point"
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
                    <Label htmlFor="password">
                      キルポイント
                      <span className="text-red-500 text-xs">必須</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="kill_point"
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
                    <Label htmlFor="password">
                      Team Death Match順位ポイント
                      <span className="text-red-500 text-xs">必須</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        デフォルトで使用、最初に追加したマッチに適用されます。
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
                  <Label htmlFor="password">
                    順位ポイント
                    <span className="text-red-500 text-xs">必須</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      デフォルトで使用、最初に追加したマッチに適用されます。
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
          <Button type="submit" className="w-full">
            <Save />
            保存して作成
          </Button>
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                type="button"
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
