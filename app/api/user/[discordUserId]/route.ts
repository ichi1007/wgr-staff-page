import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ discordUserId: string }> }
) {
  try {
    const { discordUserId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: discordUserId },
      include: {
        discord: true,
        verify: true,
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Discord CDNのアバターURLを安全に構築
    const getAvatarUrl = (
      avatar: string | null,
      userId: string
    ): string | null => {
      if (!avatar) return null;

      // 既に完全なURLの場合
      if (avatar.startsWith("http")) {
        return avatar;
      }

      // Discord CDNのURL形式で構築
      return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`;
    };

    // レスポンス用にデータを整形
    const response = {
      id: user.id,
      displayName: user.name,
      email: user.email,
      status: user.status,
      avatar: getAvatarUrl(user.discord?.avatar || null, user.id),
      roles: user.userRoles.map((ur) => ur.role),
      teams: user.userTeams.map((ut) => ut.team),
      createdAt: user.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ discordUserId: string }> }
) {
  try {
    const { discordUserId } = await params;
    const { displayName, email } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: discordUserId },
      data: {
        name: displayName,
        email: email,
      },
      include: {
        discord: true,
        verify: true,
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

    // レスポンス用にデータを整形
    const response = {
      id: updatedUser.id,
      displayName: updatedUser.name,
      email: updatedUser.email,
      status: updatedUser.status,
      avatar: updatedUser.discord?.avatar,
      roles: updatedUser.userRoles.map((ur) => ur.role),
      teams: updatedUser.userTeams.map((ut) => ut.team),
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
