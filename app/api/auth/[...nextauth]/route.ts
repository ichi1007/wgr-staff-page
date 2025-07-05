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
        // ユーザーを検索または作成（Discord IDをUser IDとして使用）
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
                  avatar: user.image,
                },
              },
            },
            include: { discord: true },
          });
        } else {
          // 既存のユーザー情報を更新
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: user.name || profile.username,
              email: user.email,
            },
          });

          // Discordアバターを更新
          if (existingUser.discord) {
            await prisma.discord.update({
              where: { discordUserId: user.id },
              data: { avatar: user.image },
            });
          } else {
            // Discordレコードが存在しない場合は作成
            await prisma.discord.create({
              data: {
                discordUserId: user.id,
                userId: user.id,
                avatar: user.image,
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
      if (token.discordUserId) {
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

      // JWTトークンが既に存在する場合、データベースでユーザーを確認
      if (token.discordUserId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.discordUserId },
          });

          if (!dbUser) {
            // ユーザーが存在しない場合はトークンを無効化
            return null;
          }
        } catch (error) {
          console.error("Error checking user in JWT callback:", error);
          return null;
        }
      }

      return token;
    },
  },
};

// App Router用にGET/POSTをエクスポート
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
