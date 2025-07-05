import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ discordUserId: string }> }
) {
  try {
    const { discordUserId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: discordUserId },
      include: {
        discord: true,
        team: {
          include: {
            roll: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roles = [];
    if (user.team?.roll) {
      const { roll } = user.team;
      if (roll.read) roles.push({ id: "1", name: "read", label: "読み" });
      if (roll.write) roles.push({ id: "2", name: "write", label: "書き" });
      if (roll.create) roles.push({ id: "3", name: "create", label: "作成" });
      if (roll.delete) roles.push({ id: "4", name: "delete", label: "削除" });
      if (roll.admin) roles.push({ id: "5", name: "admin", label: "管理者" });
    }

    const formattedUser = {
      id: user.id,
      displayName: user.name,
      email: user.email,
      roles,
      teams: user.team ? [user.team.teamName] : [],
      status: user.status,
      avatar: user.discord?.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.discord.avatar}.png`
        : null,
      discordName: user.discord?.discordName,
      createdAt: user.createdAt,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
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
        team: {
          include: {
            roll: true,
          },
        },
      },
    });

    const roles = [];
    if (updatedUser.team?.roll) {
      const { roll } = updatedUser.team;
      if (roll.read) roles.push({ id: "1", name: "read", label: "読み" });
      if (roll.write) roles.push({ id: "2", name: "write", label: "書き" });
      if (roll.create) roles.push({ id: "3", name: "create", label: "作成" });
      if (roll.delete) roles.push({ id: "4", name: "delete", label: "削除" });
      if (roll.admin) roles.push({ id: "5", name: "admin", label: "管理者" });
    }

    const formattedUser = {
      id: updatedUser.id,
      displayName: updatedUser.name,
      email: updatedUser.email,
      roles,
      teams: updatedUser.team ? [updatedUser.team.teamName] : [],
      status: updatedUser.status,
      avatar: updatedUser.discord?.avatar
        ? `https://cdn.discordapp.com/avatars/${updatedUser.id}/${updatedUser.discord.avatar}.png`
        : null,
      discordName: updatedUser.discord?.discordName,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
