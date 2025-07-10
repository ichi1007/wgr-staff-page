"use client";

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
import { useEffect, useState } from "react";
import axios from "axios";

type Custom = {
  id: string;
  customName: string;
  description: string | null;
  creatorName: string;
  createdAt: string;
  pointMode: string;
};

export default function CustomListPage() {
  const [customs, setCustoms] = useState<Custom[]>([]); // 型を指定
  const [loading, setLoading] = useState(false); // ローディング状態を追加

  const fetchCustoms = async () => {
    try {
      setLoading(true); // ローディング開始
      const response = await axios.get<Custom[]>("/api/customs/list"); // 型を指定
      setCustoms(response.data);
    } catch (error) {
      console.error("Error fetching customs:", error);
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  useEffect(() => {
    fetchCustoms(); // 初回データ取得
  }, []);

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
            <Button variant="outline" onClick={fetchCustoms} disabled={loading}>
              <RotateCw className={loading ? "animate-spin" : ""} />
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
              {customs.map((custom) => (
                <Link
                  key={custom.id}
                  href={`/custom/list/${custom.id}`}
                  className="block"
                >
                  <div className="border px-5 py-4 rounded-md flex items-start justify-between gap-2 hover:bg-gray-50 transition-colors my-3">
                    <div>
                      <h2 className="font-semibold text-xl">
                        {custom.customName}
                      </h2>
                      <p className="text-sm pt-2 pl-2">クリックで移動します</p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center gap-2 my-1">
                        <UserRound className="h-4 w-4" />
                        作成 :
                        <span className="font-extrabold">
                          {custom.creatorName}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 my-1">
                        <Clock className="h-4 w-4" />
                        日時 :
                        <span className="font-extrabold">
                          {new Date(custom.createdAt).toLocaleString()}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 my-1">
                        <Scale className="h-4 w-4" />
                        ポイントモード :
                        <span className="font-extrabold">
                          {custom.pointMode}
                        </span>
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
