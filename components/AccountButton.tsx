"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
}

export default function AccountButton() {
  const [open, setOpen] = useState(false);
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

  // URLの有効性をチェックする関数
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Discord CDNのアバターURLを構築する関数
  const getDiscordAvatarUrl = (
    avatar: string | undefined,
    userId: string
  ): string | null => {
    if (!avatar) return null;

    // 既に完全なURLの場合はそのまま使用
    if (avatar.startsWith("http")) {
      return avatar;
    }

    // Discord CDNのURL形式で構築
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`;
  };

  if (!session?.user || !userData) return null;

  const avatarUrl = getDiscordAvatarUrl(userData.avatar, userData.id);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="rounded-full overflow-hidden"
          whileHover="expanded"
          initial="collapsed"
        >
          <motion.div
            className="flex items-center bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors rounded-full"
            variants={{
              collapsed: { gap: 0, paddingLeft: 0, paddingRight: 0 },
              expanded: { gap: 8, paddingLeft: 0, paddingRight: 12 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Avatar className="cursor-pointer w-10 h-10 flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userData.displayName ?? "avatar"}
                  width={38}
                  height={38}
                  className="rounded-full object-cover w-full h-full"
                  onError={(e) => {
                    // 画像読み込みエラー時にfallbackを表示
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                  {userData?.displayName?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <motion.div
              className="overflow-hidden whitespace-nowrap cursor-pointer"
              variants={{
                collapsed: { width: 0, opacity: 0 },
                expanded: { width: "auto", opacity: 1 },
              }}
              transition={{
                width: { duration: 0.3, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.1 },
              }}
            >
              <span className="text-sm font-medium text-gray-900">
                {userData.displayName}
              </span>
            </motion.div>
          </motion.div>
        </motion.button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {open && (
          <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 py-4 border-b bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={userData.displayName ?? "avatar"}
                        width={36}
                        height={36}
                        className="rounded-full object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                        {userData?.displayName?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {userData.displayName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {userData.email ?? ""}
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <DropdownMenuItem
                  asChild
                  className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <Link href="/mypage" className="flex items-center gap-3">
                    <UserRound className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">マイページ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-4 py-2 cursor-pointer hover:bg-red-50 focus:bg-red-50"
                  onClick={() => signOut()}
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      ログアウト
                    </span>
                  </div>
                </DropdownMenuItem>
              </div>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
