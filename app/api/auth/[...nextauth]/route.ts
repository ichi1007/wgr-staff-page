import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, profile }: any) {
      try {
        // ユーザーを検索（Discord IDをUser IDとして使用）
        let existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { discord: true },
        });

        if (!existingUser) {
          // 新しいユーザーとDiscordレコードを同時に作成
          await prisma.user.create({
            data: {
              id: user.id, // Discord IDをそのままUser IDとして使用
              name: user.name || profile.username,
              email: user.email,
              discord: {
                create: {
                  discordUserId: user.id,
                  discordName: user.name || profile.username,
                  avatar:
                    profile.avatar ||
                    user.image?.split("/").pop()?.split(".")[0],
                },
              },
            },
            include: { discord: true },
          });
        } else {
          // 既存のユーザーの場合はavatarのみ更新
          if (existingUser.discord) {
            const newAvatar =
              profile.avatar || user.image?.split("/").pop()?.split(".")[0];

            // avatarが変更された場合のみ更新
            if (existingUser.discord.avatar !== newAvatar) {
              await prisma.discord.update({
                where: { discordUserId: user.id },
                data: {
                  avatar: newAvatar,
                },
              });
            }
          } else {
            // Discordレコードが存在しない場合は作成
            await prisma.discord.create({
              data: {
                discordUserId: user.id,
                userId: user.id,
                discordName: user.name || profile.username,
                avatar:
                  profile.avatar || user.image?.split("/").pop()?.split(".")[0],
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error saving user to database:", error);
        return false;
      }
    },
    async session({ session, token }: any) {
      if (token?.discordUserId) {
        // データベースでユーザーの存在を確認
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.discordUserId },
            include: { discord: true },
          });

          if (!dbUser) {
            // ユーザーが存在しない場合はセッションを無効化
            return null;
          }

          session.user.discordUserId = token.discordUserId;
          session.user.id = token.discordUserId;

          // ロールとチーム情報をセッションに追加（nullチェック）
          session.user.hasAdminRole = token.hasAdminRole || false;
          session.user.roles = token.roles || [];
          session.user.teams = token.teams || [];
        } catch (error) {
          console.error("Error checking user in database:", error);
          return null;
        }
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.discordUserId = user.id;
      }

      // JWTトークンが既に存在する場合、データベースでユーザーとロール情報を確認
      if (token?.discordUserId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.discordUserId },
            include: {
              userRoles: {
                include: {
                  role: true,
                },
              },
              userTeams: {
                include: {
                  team: true,
                },
              },
            },
          });

          if (!dbUser) {
            // ユーザーが存在しない場合はトークンを無効化
            console.warn(`User not found: ${token.discordUserId}`);
            return null;
          }

          // ロール情報をトークンに追加
          const roles = dbUser.userRoles?.map((ur) => ur.role) || [];
          const teams = dbUser.userTeams?.map((ut) => ut.team) || [];

          token.hasAdminRole = roles.some((role) => role.name === "admin");
          token.roles = roles;
          token.teams = teams;
        } catch (error) {
          console.error("Error checking user in JWT callback:", error);
          // エラーが発生した場合はデフォルト値を設定
          token.hasAdminRole = false;
          token.roles = [];
          token.teams = [];
        }
      }

      return token;
    },
  },
};

// App Router用にGET/POSTをエクスポート
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
