"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Calendar,
  Link as LinkIcon,
  Mail,
  Save,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import DiscordLogo from "@/public/svg/Discord-Symbol-Blurple.svg";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  roles: Array<{ id: string; name: string; label: string }>;
  teams: string[];
  status: boolean;
  avatar?: string;
  discordName?: string;
  createdAt: string;
}

export default function MyPageComp() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.discordUserId) {
        try {
          const response = await fetch(
            `/api/user/${session.user.discordUserId}`
          );
          if (response.ok) {
            const userData = await response.json();
            setProfileData(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (profileData) {
      setDisplayName(profileData.displayName);
      setEmail(profileData.email);
    }
  }, [profileData]);

  const handleRefresh = async () => {
    if (session?.user?.discordUserId) {
      setRefreshing(true);
      try {
        const response = await fetch(`/api/user/${session.user.discordUserId}`);
        if (response.ok) {
          const userData = await response.json();
          setProfileData(userData);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleCopyId = async () => {
    if (profileData?.id) {
      try {
        await navigator.clipboard.writeText(profileData.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const handleSaveDisplayName = async () => {
    if (
      !session?.user?.discordUserId ||
      displayName === profileData?.displayName
    )
      return;

    setSavingDisplayName(true);
    try {
      const response = await fetch(`/api/user/${session.user.discordUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          email: profileData?.email,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfileData(updatedUser);
      }
    } catch (error) {
      console.error("Error saving display name:", error);
    } finally {
      setSavingDisplayName(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!session?.user?.discordUserId || email === profileData?.email) return;

    setSavingEmail(true);
    try {
      const response = await fetch(`/api/user/${session.user.discordUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: profileData?.displayName,
          email,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfileData(updatedUser);
      }
    } catch (error) {
      console.error("Error saving email:", error);
    } finally {
      setSavingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8 flex items-center justify-center">
        読み込み中...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8 flex items-center justify-center">
        ユーザーデータが見つかりません
      </div>
    );
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const getUserRole = () => {
    const adminRole = profileData.roles.find((role) => role.name === "admin");
    return adminRole ? "管理者" : "一般ユーザー";
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border overflow-hidden"
        >
          {/* グラデーションヘッダー */}
          <motion.div
            className="h-48 relative overflow-hidden"
            animate={{
              background: [
                "linear-gradient(270deg, #3B82F6, #8B5CF6, #EC4899)",
                "linear-gradient(270deg, #8B5CF6, #EC4899, #F59E0B)",
                "linear-gradient(270deg, #EC4899, #F59E0B, #10B981)",
                "linear-gradient(270deg, #F59E0B, #10B981, #06B6D4)",
                "linear-gradient(270deg, #10B981, #06B6D4, #3B82F6)",
                "linear-gradient(270deg, #06B6D4, #3B82F6, #8B5CF6)",
                "linear-gradient(270deg, #3B82F6, #8B5CF6, #EC4899)",
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          ></motion.div>

          {/* プロフィール情報 */}
          <div className="px-6 pb-6">
            {/* アバターとボタン */}
            <div className="flex justify-between items-end -mt-16 mb-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage
                        key={`avatar-${profileData.avatar}`}
                        src={profileData.avatar || "/placeholder-avatar.jpg"}
                      />
                      <AvatarFallback className="text-2xl bg-gray-200">
                        <p className="text-sm">アバター画像</p>
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Discordのアバター画像が使用されます。
                      <br />
                      ログイン時に自動的に取得されます。
                    </p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="lg"
                className="mt-1 z-50"
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                更新
              </Button>
            </div>

            {/* ユーザー名と情報 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1
                    key={`name-${profileData.displayName}`}
                    className="text-2xl font-bold text-gray-900"
                  >
                    {profileData.displayName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p key={`id-${profileData.id}`} className="text-gray-500">
                      @{profileData.id}
                    </p>
                    <Tooltip>
                      <TooltipTrigger className="cursor-pointer">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyId}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          コピーボタン
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* メタ情報 */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profileData.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span key={`email-${profileData.email}`}>
                      {profileData.email}
                    </span>
                  </div>
                )}

                {profileData.discordName && (
                  <div className="flex items-center gap-1">
                    <Image src={DiscordLogo} alt="Discord Logo" width={20} />
                    <span key={`discord-${profileData.discordName}`}>
                      Discord: {profileData.discordName}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span key={`join-${profileData.createdAt}`}>
                    参加日：{formatJoinDate(profileData.createdAt)}
                  </span>
                </div>
              </div>

              {/* bio, location, websiteの表示部分 */}
            </motion.div>
          </div>
          <Tabs defaultValue="account">
            <TabsList className="mx-auto w-[700px]">
              <TabsTrigger value="account">アカウント情報</TabsTrigger>
              <TabsTrigger value="link_app">連携アプリ</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="my-10">
              <div className="max-w-lg mx-auto space-y-6">
                {/* 表示名編集 */}
                <div className="w-full">
                  <div className="mb-1">
                    <Label htmlFor="display_name">表示名</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      id="display_name"
                      placeholder="表示名を入力"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      variant="default"
                      disabled={
                        displayName === profileData.displayName ||
                        savingDisplayName
                      }
                      onClick={handleSaveDisplayName}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {savingDisplayName ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </div>
                {/* メール編集 */}
                <div className="w-full">
                  <div className="mb-1">
                    <Label htmlFor="mail">メールアドレス</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      id="mail"
                      placeholder="sample@wgr.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      variant="default"
                      disabled={email === profileData.email || savingEmail}
                      onClick={handleSaveEmail}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {savingEmail ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </div>
                {/* 所属チーム・ユーザー区分 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-md p-4">
                    <Label className="block mb-2 text-xs text-muted-foreground">
                      所属チーム
                    </Label>
                    <div
                      key={`team-${profileData.teams.join(",")}`}
                      className="text-base font-medium"
                    >
                      {profileData.teams.length > 0
                        ? profileData.teams[0]
                        : "未所属"}
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-4">
                    <Label className="block mb-2 text-xs text-muted-foreground">
                      ユーザー区分
                    </Label>
                    <div
                      key={`role-${getUserRole()}`}
                      className="text-base font-medium"
                    >
                      {getUserRole()}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="link_app">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Discord連携
                  </CardTitle>
                  <CardDescription>
                    Discordアカウントとの連携を確認できます
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Discord名
                    </Label>
                    <div
                      key={`discord-name-${profileData.discordName}`}
                      className="p-3 bg-muted/50 rounded-lg"
                    >
                      {profileData.discordName || "未連携"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Discord ID
                    </Label>
                    <div
                      key={`discord-id-${profileData.id}`}
                      className="p-3 bg-muted/50 rounded-lg"
                    >
                      {profileData.id || "未連携"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">Discord連携状況</h4>
                        <p className="text-sm text-muted-foreground">
                          {profileData.discordName
                            ? "Discordアカウントが連携されています"
                            : "Discordアカウントが連携されていません"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profileData.discordName ? (
                          <div
                            key={`status-connected-${profileData.discordName}`}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">
                              連携済み
                            </span>
                          </div>
                        ) : (
                          <div
                            key="status-disconnected"
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                            <span className="text-sm">未連携</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!profileData.discordName && (
                      <div className="flex gap-2">
                        <Button variant="default" className="rounded-full">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Discordと連携
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
