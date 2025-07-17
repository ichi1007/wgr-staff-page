import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaClient } from "@prisma/client";
import { Session, User as NextAuthUser, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole, UserTeam, Role, Team } from "@prisma/client"; // Import necessary types

const prisma = new PrismaClient();

interface DiscordProfile extends Profile {
  username?: string;
  avatar?: string;
}

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, profile }: { user: NextAuthUser; profile?: Profile }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { discord: true }, // Changed from discord to Discord
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              name: user.name || (profile as DiscordProfile)?.username || "",
              email: user.email || "",
              discord: {
                // Changed from discord to Discord
                create: {
                  discordUserId: user.id,
                  discordName:
                    user.name || (profile as DiscordProfile)?.username || "",
                  avatar:
                    (profile as DiscordProfile)?.avatar ||
                    user.image?.split("/").pop()?.split(".")[0],
                },
              },
            },
            include: { discord: true }, // Changed from discord to Discord
          });
        } else {
          if (existingUser.discord) {
            // Changed from existingUser.discord to existingUser.Discord
            const newAvatar =
              (profile as DiscordProfile)?.avatar ||
              user.image?.split("/").pop()?.split(".")[0];

            if (existingUser.discord.avatar !== newAvatar) {
              // Changed from existingUser.discord.avatar to existingUser.Discord.avatar
              await prisma.discord.update({
                where: { discordUserId: user.id },
                data: {
                  avatar: newAvatar,
                },
              });
            }
          } else {
            await prisma.discord.create({
              // Changed from prisma.Discord.create to prisma.discord.create
              data: {
                discordUserId: user.id,
                userId: user.id,
                discordName:
                  user.name || (profile as DiscordProfile)?.username || "",
                avatar:
                  (profile as DiscordProfile)?.avatar ||
                  user.image?.split("/").pop()?.split(".")[0], // Fixed unterminated string literal and missing comma
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
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.discordUserId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.discordUserId },
            include: { discord: true }, // Changed from discord to Discord
          });

          if (!dbUser) {
            throw new Error("User not found");
          }

          session.user.discordUserId = token.discordUserId;
          session.user.id = token.discordUserId;
          session.user.hasAdminRole = token.hasAdminRole || false;
          session.user.roles = token.roles || [];
          session.user.teams = token.teams || [];
        } catch (error) {
          console.error("Error checking user in database:", error);
          throw new Error("Session validation failed");
        }
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.discordUserId = user.id;
      }

      if (token?.discordUserId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.discordUserId },
            include: {
              userRoles: {
                // 修正: 正しいリレーション名を指定
                include: {
                  role: true, // 修正: 正しいリレーション名を指定
                },
              },
              userTeams: {
                // 修正: 正しいリレーション名を指定
                include: {
                  team: true, // 修正: 正しいリレーション名を指定
                },
              },
            },
          });

          if (!dbUser) {
            console.warn(`User not found: ${token.discordUserId}`);
            delete token.discordUserId;
            token.hasAdminRole = false;
            token.roles = [];
            token.teams = [];
            return token;
          }

          const roles =
            dbUser.userRoles?.map((ur) => ({
              id: Number(ur.role.id), // 修正: idをnumberに変換
              name: ur.role.name,
              label: ur.role.label,
            })) || [];

          const teams =
            dbUser.userTeams?.map((ut) => ({
              id: Number(ut.team.id), // 修正: idをnumberに変換
              name: ut.team.name,
            })) || [];

          token.hasAdminRole = roles.some((role) => role.name === "admin");
          token.roles = roles;
          token.teams = teams;
        } catch (error) {
          console.error("Error checking user in JWT callback:", error);
          token.hasAdminRole = false;
          token.roles = [];
          token.teams = [];
        }
      }

      return token;
    },
  },
};
