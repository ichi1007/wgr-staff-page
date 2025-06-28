"use client";

import Image from "next/image";
import Logo from "@/public/img/wgr_logo.png";
import Link from "next/link";
// 追加: shadcn/ui, framer-motion
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function HeaderComp() {
  // ドロップダウンの開閉状態管理
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  // Discordユーザー情報取得
  const user = session?.user;

  return (
    <header className="fixed w-full bg-white py-3 px-5 z-10 flex justify-between items-center shadow-md">
      {/* ロゴ */}
      <Link href="/" className="flex items-center">
        <Image src={Logo} alt="WGR_Logo" width={50} />
        <h1 className="text-black font-extrabold text-xl">WGR Staff Page</h1>
      </Link>
      {/* アカウント情報 */}
      {user && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 transition cursor-pointer">
              <Avatar className="cursor-pointer">
                {/* Discordアイコン表示 */}
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "avatar"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                )}
              </Avatar>
              <span className="font-bold text-base text-black">
                {user.name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <AnimatePresence>
            {open && (
              <DropdownMenuContent asChild align="end" sideOffset={8}>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="w-56 rounded-md bg-white shadow-lg border p-0"
                >
                  <div className="px-4 py-3 border-b">
                    <div className="font-bold text-base">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {user.email ?? ""}
                    </div>
                  </div>
                  <DropdownMenuItem
                    asChild
                    className="py-2 px-4 cursor-pointer"
                  >
                    <Link href="/mypage">
                      <UserRound className="text-black" />
                      マイページ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-2 px-4 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="text-red-500" />
                    ログアウト
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            )}
          </AnimatePresence>
        </DropdownMenu>
      )}
    </header>
  );
}
