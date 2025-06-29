"use client";

import Image from "next/image";
import Logo from "@/public/img/wgr_logo.png";
import Link from "next/link";
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
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <header className="w-full py-3 px-5 z-10 flex justify-between items-center bg-white shadow-md">
      {/* ロゴ */}
      <div className="flex items-end">
        <Link href="/">
          <Image
            src={Logo}
            alt="WGR_Logo"
            width={50}
            className="block pointer-events-none"
            draggable={false}
          />
        </Link>
        <div className="w-[1px] h-[50px] bg-black mx-2" />
        <h1
          className="font-extrabold text-xl mb-2 select-none text-black"
          draggable={false}
        >
          Staff Page
        </h1>
      </div>
      {/* アカウント情報 */}
      {user && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1 rounded-md bg-white hover:bg-gray-100 transition cursor-pointer border">
              <Avatar className="cursor-pointer w-8 h-8">
                {/* Discordアイコン */}
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "avatar"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover border-2 w-full h-full"
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
              <DropdownMenuContent align="end" sideOffset={0}>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="w-56 p-0 overflow-hidden"
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
