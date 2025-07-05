import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      discordUserId?: string;
      hasAdminRole?: boolean;
      roles?: Array<{
        id: number;
        name: string;
        label: string;
      }>;
      teams?: Array<{
        id: number;
        name: string;
      }>;
    };
  }

  interface User {
    id: string; // Discord IDと同じString型
    discordUserId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordUserId?: string;
    hasAdminRole?: boolean;
    roles?: Array<{
      id: number;
      name: string;
      label: string;
    }>;
    teams?: Array<{
      id: number;
      name: string;
    }>;
  }
}
