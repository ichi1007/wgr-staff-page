import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CirclePlus,
  Clock,
  List,
  RotateCw,
  Scale,
  UserRound,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function CustomListPage() {
  return (
    <div className="h-screen pt-20 pb-4 px-4">
      <Card className="w-full max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-2xl flex items-center gap-2">
            <List />
            カスタム一覧
          </CardTitle>
          <CardDescription>
            作成済みのカスタムを一覧表示します。新規カスタムを作成することもできます。
          </CardDescription>
          <CardAction className="flex items-center gap-2">
            <Button variant="outline">
              <RotateCw />
              更新
            </Button>
            <Button asChild>
              <Link href="/custom/create">
                <CirclePlus />
                新規カスタムを作成
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-6">
            <div className="space-y-4 py-6">
              <Link href="/custom/list/:1" className="block">
                <div className="border px-5 py-4 rounded-md flex items-start justify-between gap-2 hover:bg-gray-50 transition-colors my-3">
                  <div>
                    <h2 className="font-semibold text-xl">WGR CUP 1</h2>
                    <p>xxxxxxxxxxxxxxxxxxxxxxx</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-2 my-1">
                      <UserRound className="h-4 w-4" />
                      作成 :<span className="font-extrabold">{`UserName`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Clock className="h-4 w-4" />
                      日時 :
                      <span className="font-extrabold">{`2023/10/01 12:00`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Scale className="h-4 w-4" />
                      ポイントモード :
                      <span className="font-extrabold">{`ALGS`}</span>
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/custom/list/:2" className="block">
                <div className="border px-5 py-4 rounded-md flex items-start justify-between gap-2 hover:bg-gray-50 transition-colors my-3">
                  <h2 className="font-semibold text-xl">{`WGR CUP 2`}</h2>
                  <div className="text-right">
                    <p className="flex items-center gap-2 my-1">
                      <UserRound className="h-4 w-4" />
                      Create :
                      <span className="font-extrabold">{`UserName`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Clock className="h-4 w-4" />
                      Create At :
                      <span className="font-extrabold">{`2023/10/01 12:00`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Scale className="h-4 w-4" />
                      Point Mode :
                      <span className="font-extrabold">{`Poland Rule`}</span>
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/custom/list/:3" className="block">
                <div className="border px-5 py-4 rounded-md flex items-start justify-between gap-2 hover:bg-gray-50 transition-colors my-3">
                  <h2 className="font-semibold text-xl">{`WGR CUP 3`}</h2>
                  <div className="text-right">
                    <p className="flex items-center gap-2 my-1">
                      <UserRound className="h-4 w-4" />
                      Create :
                      <span className="font-extrabold">{`UserName`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Clock className="h-4 w-4" />
                      Create At :
                      <span className="font-extrabold">{`2023/10/01 12:00`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Scale className="h-4 w-4" />
                      Point Mode :
                      <span className="font-extrabold">{`Poland Rule`}</span>
                    </p>
                  </div>
                </div>
              </Link>

              {/* 追加のダミーアイテム（スクロールテスト用） */}
              {Array.from({ length: 10 }, (_, i) => (
                <Link
                  key={i + 4}
                  href={`/custom/list/:${i + 4}`}
                  className="block"
                >
                  <div className="border px-5 py-4 rounded-md flex items-start justify-between gap-2 hover:bg-gray-50 transition-colors my-3">
                    <h2 className="font-semibold text-xl">{`WGR CUP ${
                      i + 4
                    }`}</h2>
                    <div className="text-right">
                      <p className="flex items-center gap-2 my-1">
                        <UserRound className="h-4 w-4" />
                        Create :
                        <span className="font-extrabold">{`UserName`}</span>
                      </p>
                      <p className="flex items-center gap-2 my-1">
                        <Clock className="h-4 w-4" />
                        Create At :
                        <span className="font-extrabold">{`2023/10/0${
                          i + 1
                        } 12:00`}</span>
                      </p>
                      <p className="flex items-center gap-2 my-1">
                        <Scale className="h-4 w-4" />
                        Point Mode :
                        <span className="font-extrabold">{`Custom Rule`}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex-shrink-0">
          <div></div>
        </CardFooter>
      </Card>
    </div>
  );
}
