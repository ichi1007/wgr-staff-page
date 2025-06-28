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

export const metadata = {
  title: "カスタムを作成 | WGR Staff Page(仮称)",
  description: "このページで、カスタムを作成できます。",
};

export default function CreateCustomPage() {
  return (
    <div className="my-10">
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  ポイントモード
                  <span className="text-red-500 text-xs">必須</span>
                </Label>
                <Select required>
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
              <div className="grid gap-2">
                <Label htmlFor="password">
                  キルポイント上限
                  <span className="text-red-500 text-xs">必須</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    デフォルトで使用、最初に追加したマッチに適用されます。
                  </span>
                </Label>
                <Select required>
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
                  同着の際に順位を決定するポイント
                  <span className="text-red-500 text-xs">必須</span>
                </Label>
                <Select required>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select_placement_point">
                      順位ポイント
                    </SelectItem>
                    <SelectItem value="select_kill_point">
                      キルポイント
                    </SelectItem>
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
                    defaultValue="1"
                    required
                    className="w-24"
                  />
                  <p>pt</p>
                </div>
              </div>
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
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="flex flex-col gap-2">
                            {/* 1位〜10位 */}
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between border rounded px-3 py-1 bg-white"
                              >
                                <span>{i + 1}位:</span>
                                <Input
                                  type="number"
                                  className="w-16 h-8 text-right"
                                  defaultValue={
                                    [12, 9, 7, 5, 4, 3, 3, 2, 2, 2][i]
                                  }
                                  min={0}
                                />
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
                                <Input
                                  type="number"
                                  className="w-16 h-8 text-right"
                                  defaultValue={
                                    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0][i]
                                  }
                                  min={0}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            <Save />
            保存して作成
          </Button>
          <Button variant="outline" className="w-full">
            <Trash2 className="text-red-500" />
            記入内容をリセット
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
