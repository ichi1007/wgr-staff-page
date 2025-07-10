import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
const prisma = new (require("@prisma/client").PrismaClient)();
import { Session, User as NextAuthUser, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";

interface DiscordProfile extends Profile {
  username?: string;
  avatar?: string;
}

const authOptions = {
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
          include: { discord: true },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              name: user.name || (profile as DiscordProfile)?.username || "",
              email: user.email || "",
              discord: {
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
            include: { discord: true },
          });
        } else {
          if (existingUser.discord) {
            const newAvatar =
              (profile as DiscordProfile)?.avatar ||
              user.image?.split("/").pop()?.split(".")[0];

            if (existingUser.discord.avatar !== newAvatar) {
              await prisma.discord.update({
                where: { discordUserId: user.id },
                data: {
                  avatar: newAvatar,
                },
              });
            }
          } else {
            await prisma.discord.create({
              data: {
                discordUserId: user.id,
                userId: user.id,
                discordName:
                  user.name || (profile as DiscordProfile)?.username || "",
                avatar:
                  (profile as DiscordProfile)?.avatar ||
                  user.image?.split("/").pop()?.split(".")[0],
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
            include: { discord: true },
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
            console.warn(`User not found: ${token.discordUserId}`);
            // nullを返す代わりに、discordUserIdを削除して無効化
            delete token.discordUserId;
            token.hasAdminRole = false;
            token.roles = [];
            token.teams = [];
            return token;
          }

          const roles =
            dbUser.userRoles?.map((ur: any) => ({
              id: parseInt(ur.role.id),
              name: ur.role.name,
              label: ur.role.label,
            })) || [];

          const teams =
            dbUser.userTeams?.map((ut: any) => ({
              id: parseInt(ut.team.id),
              name: ut.team.name,
            })) || [];

          token.hasAdminRole = roles.some((role: any) => role.name === "admin");
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

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
