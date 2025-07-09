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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomIdPageComp() {
  const id = useParams().id;

  return (
    <div className="pt-20 mb-5">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>
            <p className="text-2xl">{id}</p>
          </CardTitle>
          <CardDescription>
            マッチの詳細情報を表示します。
            <br />
            PP = 順位ポイント、KP = キルポイント、ALL = 合計ポイント
          </CardDescription>
          <CardAction className="flex gap-2">
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <div className="flex items-center gap-2">
                      <Plus />
                      マッチ追加
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
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
                  <form>
                    <div className="mb-5 grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-1">順位ポイント</Label>
                        <Input
                          id="name-1"
                          name="name"
                          defaultValue="Pedro Duarte"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">キャンセル</Button>
                      </DialogClose>
                      <Button type="submit">次へ</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </form>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">その他</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>その他の操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    デフォルトの順位ポイント変更
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    デフォルトのキルポイント変更
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive">
              <Trash2 />
              削除
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="total" className="w-full">
            <TabsList>
              <TabsTrigger value="total">合計</TabsTrigger>
              <TabsTrigger value="match_1">マッチ1</TabsTrigger>
              <TabsTrigger value="match_2">マッチ2</TabsTrigger>
            </TabsList>
            <TabsContent value="total">
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                <p>順位</p>
                <p>チーム名</p>
                <p>PP</p>
                <p>KP</p>
                <p>ALL</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>1</p>
                <p>total</p>
                <p>12</p>
                <p>3</p>
                <p>15</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>2</p>
                <p>Team 2</p>
                <p>10</p>
                <p>5</p>
                <p>15</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>3</p>
                <p>Team 3</p>
                <p>8</p>
                <p>6</p>
                <p>14</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>4</p>
                <p>Team 4</p>
                <p>7</p>
                <p>6</p>
                <p>13</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>5</p>
                <p>Team 5</p>
                <p>6</p>
                <p>7</p>
                <p>13</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>6</p>
                <p>Team 6</p>
                <p>5</p>
                <p>7</p>
                <p>12</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>7</p>
                <p>Team 7</p>
                <p>4</p>
                <p>8</p>
                <p>12</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>8</p>
                <p>Team 8</p>
                <p>3</p>
                <p>8</p>
                <p>11</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>9</p>
                <p>Team 9</p>
                <p>2</p>
                <p>9</p>
                <p>11</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>10</p>
                <p>Team 10</p>
                <p>1</p>
                <p>9</p>
                <p>10</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>11</p>
                <p>Team 11</p>
                <p>0</p>
                <p>10</p>
                <p>10</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>12</p>
                <p>Team 12</p>
                <p>0</p>
                <p>9</p>
                <p>9</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>13</p>
                <p>Team 13</p>
                <p>0</p>
                <p>8</p>
                <p>8</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>14</p>
                <p>Team 14</p>
                <p>0</p>
                <p>7</p>
                <p>7</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>15</p>
                <p>Team 15</p>
                <p>0</p>
                <p>6</p>
                <p>6</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>16</p>
                <p>Team 16</p>
                <p>0</p>
                <p>5</p>
                <p>5</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>17</p>
                <p>Team 17</p>
                <p>0</p>
                <p>4</p>
                <p>4</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>18</p>
                <p>Team 18</p>
                <p>0</p>
                <p>3</p>
                <p>3</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>19</p>
                <p>Team 19</p>
                <p>0</p>
                <p>2</p>
                <p>2</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>20</p>
                <p>Team 20</p>
                <p>0</p>
                <p>1</p>
                <p>1</p>
              </div>
            </TabsContent>
            <TabsContent value="match_1">
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                <p>順位</p>
                <p>チーム名</p>
                <p>PP</p>
                <p>KP</p>
                <p>ALL</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>1</p>
                <p>match 1</p>
                <p>12</p>
                <p>3</p>
                <p>15</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>2</p>
                <p>Team 2</p>
                <p>10</p>
                <p>5</p>
                <p>15</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>3</p>
                <p>Team 3</p>
                <p>8</p>
                <p>6</p>
                <p>14</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>4</p>
                <p>Team 4</p>
                <p>7</p>
                <p>6</p>
                <p>13</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>5</p>
                <p>Team 5</p>
                <p>6</p>
                <p>7</p>
                <p>13</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>6</p>
                <p>Team 6</p>
                <p>5</p>
                <p>7</p>
                <p>12</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>7</p>
                <p>Team 7</p>
                <p>4</p>
                <p>8</p>
                <p>12</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>8</p>
                <p>Team 8</p>
                <p>3</p>
                <p>8</p>
                <p>11</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>9</p>
                <p>Team 9</p>
                <p>2</p>
                <p>9</p>
                <p>11</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>10</p>
                <p>Team 10</p>
                <p>1</p>
                <p>9</p>
                <p>10</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>11</p>
                <p>Team 11</p>
                <p>0</p>
                <p>10</p>
                <p>10</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>12</p>
                <p>Team 12</p>
                <p>0</p>
                <p>9</p>
                <p>9</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>13</p>
                <p>Team 13</p>
                <p>0</p>
                <p>8</p>
                <p>8</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>14</p>
                <p>Team 14</p>
                <p>0</p>
                <p>7</p>
                <p>7</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>15</p>
                <p>Team 15</p>
                <p>0</p>
                <p>6</p>
                <p>6</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>16</p>
                <p>Team 16</p>
                <p>0</p>
                <p>5</p>
                <p>5</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>17</p>
                <p>Team 17</p>
                <p>0</p>
                <p>4</p>
                <p>4</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>18</p>
                <p>Team 18</p>
                <p>0</p>
                <p>3</p>
                <p>3</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>19</p>
                <p>Team 19</p>
                <p>0</p>
                <p>2</p>
                <p>2</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>20</p>
                <p>Team 20</p>
                <p>0</p>
                <p>1</p>
                <p>1</p>
              </div>
            </TabsContent>
            <TabsContent value="match_2">
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                <p>順位</p>
                <p>チーム名</p>
                <p>PP</p>
                <p>KP</p>
                <p>ALL</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>1</p>
                <p>match 2</p>
                <p>12</p>
                <p>3</p>
                <p>15</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>2</p>
                <p>Team 2</p>
                <p>10</p>
                <p>5</p>
                <p>15</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>3</p>
                <p>Team 3</p>
                <p>8</p>
                <p>6</p>
                <p>14</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>4</p>
                <p>Team 4</p>
                <p>7</p>
                <p>6</p>
                <p>13</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>5</p>
                <p>Team 5</p>
                <p>6</p>
                <p>7</p>
                <p>13</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>6</p>
                <p>Team 6</p>
                <p>5</p>
                <p>7</p>
                <p>12</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>7</p>
                <p>Team 7</p>
                <p>4</p>
                <p>8</p>
                <p>12</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>8</p>
                <p>Team 8</p>
                <p>3</p>
                <p>8</p>
                <p>11</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>9</p>
                <p>Team 9</p>
                <p>2</p>
                <p>9</p>
                <p>11</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>10</p>
                <p>Team 10</p>
                <p>1</p>
                <p>9</p>
                <p>10</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>11</p>
                <p>Team 11</p>
                <p>0</p>
                <p>10</p>
                <p>10</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>12</p>
                <p>Team 12</p>
                <p>0</p>
                <p>9</p>
                <p>9</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>13</p>
                <p>Team 13</p>
                <p>0</p>
                <p>8</p>
                <p>8</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>14</p>
                <p>Team 14</p>
                <p>0</p>
                <p>7</p>
                <p>7</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>15</p>
                <p>Team 15</p>
                <p>0</p>
                <p>6</p>
                <p>6</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>16</p>
                <p>Team 16</p>
                <p>0</p>
                <p>5</p>
                <p>5</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>17</p>
                <p>Team 17</p>
                <p>0</p>
                <p>4</p>
                <p>4</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>18</p>
                <p>Team 18</p>
                <p>0</p>
                <p>3</p>
                <p>3</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>19</p>
                <p>Team 19</p>
                <p>0</p>
                <p>2</p>
                <p>2</p>
              </div>
              <div className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3">
                <p>20</p>
                <p>Team 20</p>
                <p>0</p>
                <p>1</p>
                <p>1</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
