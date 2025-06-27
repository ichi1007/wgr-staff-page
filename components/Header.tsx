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

export default function HeaderComp() {
  // ドロップダウンの開閉状態管理
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white py-3 px-5 z-10 flex justify-between items-center shadow-md">
      {/* ロゴ */}
      <Link href="/" className="flex items-center">
        <Image src={Logo} alt="WGR_Logo" width={50} />
        <h1 className="text-black font-extrabold text-xl">WGR Staff Page</h1>
      </Link>
      {/* アカウント情報 */}
      <div className="mr-50">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 transition cursor-pointer">
              <Avatar className="cursor-pointer">
                <AvatarFallback>i</AvatarFallback>
              </Avatar>
              <span className="font-bold text-base text-black">ichi</span>
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
                    <div className="font-bold text-base">ichi</div>
                    <div className="text-xs text-gray-500">
                      ichi@example.com
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
                    onClick={() => {
                      // ログアウト処理をここに
                    }}
                  >
                    <LogOut className="text-red-500" />
                    ログアウト
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            )}
          </AnimatePresence>
        </DropdownMenu>
      </div>
    </header>
  );
}
