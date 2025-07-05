"use client";

import Image from "next/image";
import WGR_IMG from "@/public/img/wgr-ogp.png";
import DiscordButton from "@/components/DiscordButton";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  List,
  Pickaxe,
  RadioTower,
  SquareMousePointer,
  TvMinimalPlay,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
}

export default function TopPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.discordUserId) {
        try {
          const response = await fetch(
            `/api/user/${session.user.discordUserId}`
          );
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    if (session?.user?.discordUserId) {
      fetchUserData();
    }
  }, [session]);

  return (
    <div className="relative w-full min-h-screen">
      {/* 背景動画 */}
      <div className="w-full min-h-screen z-[-999] pointer-events-none absolute">
        <Image
          src={WGR_IMG}
          alt="WGR OGP Image"
          fill
          className="object-cover bg-center filter blur-sm select-none"
          draggable={false}
          priority
        />
      </div>
      {/* 中央コンテンツ */}
      <div className="flex flex-1 justify-center items-center min-h-[calc(100vh-theme(spacing.16))]">
        <div className="bg-white rounded-md px-50 py-8">
          <h1 className="text-center text-black text-2xl">
            ようこそ
            <span className="font-extrabold px-1">
              {userData?.displayName ?? session?.user?.name ?? "ゲスト"}
            </span>
            さん
          </h1>
          <p className="text-center">下のボタンを押して操作をしてください。</p>
          <br />
          <div className="text-center">
            {session ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="px-4 py-2">
                    <SquareMousePointer />
                    移動する機能を選択
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <SquareMousePointer />
                      移動する機能を選択
                    </DialogTitle>
                    <div className="flex flex-col gap-4 mt-2">
                      <Link href="/custom/create">
                        <Button className="w-full" variant="outline">
                          <Pickaxe />
                          カスタムを作成
                        </Button>
                      </Link>
                      <Link href="/custom/list">
                        <Button className="w-full" variant="outline">
                          <List />
                          カスタム一覧
                        </Button>
                      </Link>
                      <Link href="/custom/live-control">
                        <Button className="w-full" variant="outline">
                          <RadioTower />
                          ライブコントロール
                        </Button>
                      </Link>
                      <Link href="/stream/overlay">
                        <Button className="w-full" variant="outline">
                          <TvMinimalPlay />
                          オーバーレイ
                        </Button>
                      </Link>
                      <Link href="/admin/users-management">
                        <Button className="w-full" variant="outline">
                          <UsersRound />
                          ユーザー管理
                        </Button>
                      </Link>
                    </div>
                  </DialogHeader>
                  <DialogFooter>
                    <p className="text-xs">
                      右上の<span className="px-1 font-extrabold">X</span>
                      を押すか、周りの余白を押すことで閉じれます。
                    </p>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <DiscordButton />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
