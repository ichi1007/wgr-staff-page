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
import { CirclePlus, Clock, List, RotateCw, Scale, UserRound } from "lucide-react";
import Link from "next/link";

export default function CustomListPage() {
  return (
    <div className="my-13">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
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
            <Button>
              <CirclePlus />
              新規カスタムを作成
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ul>
            <li className="my-3">
              <Link href="/custom/list/:1">
                <div className="border px-5 py-3 rounded-md flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-xl">{`WGR CUP 1`}</h2>
                  <div>
                    <br />
                    <p className="flex items-center gap-2 my-1">
                      <UserRound />
                      作成 :
                      <span className="font-extrabold">{`UserName`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Clock />
                      日時 :
                      <span className="font-extrabold">{`2023/10/01 12:00`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Scale />
                      ポイントモード :
                      <span className="font-extrabold">{`ALGS`}</span>
                    </p>
                  </div>
                </div>
              </Link>
            </li>
            <li className="my-3">
              <Link href="/custom/list/:2">
                <div className="border px-5 py-3 rounded-md flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-xl">{`WGR CUP 2`}</h2>
                  <div>
                    <br />
                    <p className="flex items-center gap-2 my-1">
                      <UserRound />
                      Create :
                      <span className="font-extrabold">{`UserName`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Clock />
                      Create At :
                      <span className="font-extrabold">{`2023/10/01 12:00`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Scale />
                      Point Mode :
                      <span className="font-extrabold">{`Poland Rule`}</span>
                    </p>
                  </div>
                </div>
              </Link>
            </li>
            <li className="my-3">
              <Link href="/custom/list/:3">
                <div className="border px-5 py-3 rounded-md flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-xl">{`WGR CUP 3`}</h2>
                  <div>
                    <br />
                    <p className="flex items-center gap-2 my-1">
                      <UserRound />
                      Create :
                      <span className="font-extrabold">{`UserName`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Clock />
                      Create At :
                      <span className="font-extrabold">{`2023/10/01 12:00`}</span>
                    </p>
                    <p className="flex items-center gap-2 my-1">
                      <Scale />
                      Point Mode :
                      <span className="font-extrabold">{`Poland Rule`}</span>
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div></div>
        </CardFooter>
      </Card>
    </div>
  );
}
